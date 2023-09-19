import { Observable, Subscription, concatMap, filter, fromEvent, interval, map, mapTo, merge, mergeMap, of, startWith, switchMap, take, takeUntil, timer, zip } from "rxjs";
import { Question } from "./Question";
import { Scoreboard, ScoreboardI } from "./Scoreboard";
import { Name } from "./Name";

export class Game{
    mainDiv: HTMLDivElement
    click$: Observable<Event>;
    clickSub: Subscription;
    questions: Question[];
    lightningQuestion$: Observable<any>;

    constructor(mainDiv: HTMLDivElement) {
        this.mainDiv = mainDiv;
        this.click$ = fromEvent(this.mainDiv, "click");
    }

    CreateHome(){

        const container = document.createElement("div");
        container.classList.add("container");
        this.mainDiv.appendChild(container);

        const title = document.createElement("h1");
        title.classList.add("title");
        title.innerHTML = "90's Hip Hop Quiz";
        container.appendChild(title);

        const buttonsGrid = document.createElement("div");
        buttonsGrid.classList.add("buttonsGrid");
        container.append(buttonsGrid);

        const lightningButton = document.createElement("button");
        lightningButton.classList.add("buttonH");
        lightningButton.innerHTML = "Lightning Round";
        buttonsGrid.appendChild(lightningButton);

        const quickestButton = document.createElement("button");
        quickestButton.classList.add("buttonH");
        quickestButton.innerHTML = "Quickest Player";
        buttonsGrid.appendChild(quickestButton);

        const scoreboardButton = document.createElement("button");
        scoreboardButton.classList.add("buttonH");
        scoreboardButton.innerHTML = "Scoreboard"
        buttonsGrid.appendChild(scoreboardButton);

        const nameGeneratorButton = document.createElement("button");
        nameGeneratorButton.classList.add("buttonH");
        nameGeneratorButton.innerHTML = "Name Generator"
        buttonsGrid.appendChild(nameGeneratorButton);

        const startButton = document.createElement("button");
        startButton.classList.add("full-width");
        startButton.innerHTML = "Start";
        buttonsGrid.appendChild(startButton);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === "Start")
                this.CreateQuiz();
            else if(clickedButton.innerHTML === "Scoreboard")
                this.CreateScoreboard();
            else if(clickedButton.innerHTML === "Lightning Round")
                this.CreateLightningRound();
            else if(clickedButton.innerHTML === "Quickest Player")
                this.CreateQuickestPlayer();
            else if(clickedButton.innerHTML === "Name Generator")
                this.CreateRandomNameGenerator()
        })
    }

    Clear(){
        while(this.mainDiv.firstChild){
            this.mainDiv.removeChild(this.mainDiv.firstChild);
        }
        this.clickSub.unsubscribe();
    }

    async CreateQuiz(){
        this.Clear();

        const response = await fetch("src/data/questions.json");
        this.questions = await response.json();

        let i = Math.floor(Math.random() * this.questions.length);
        let correct_answer = this.questions[i].correct_answer;

        const container = document.createElement("div");
        container.classList.add("container");
        this.mainDiv.appendChild(container);

        const scoreLives = document.createElement("div");
        scoreLives.classList.add("scoreLives");
        container.appendChild(scoreLives);

        const scoreText = document.createElement("p");
        scoreText.classList.add("scoreText");
        scoreText.innerHTML = "Score: 0";
        scoreLives.appendChild(scoreText);

        const livesText = document.createElement("p");
        livesText.classList.add("livesText");
        livesText.innerHTML = "Lives: 3";
        scoreLives.appendChild(livesText);

        const question = document.createElement("p");
        question.classList.add("question");
        question.innerHTML = this.questions[i].question;
        container.appendChild(question);

        const buttonsGrid = document.createElement("div");
        buttonsGrid.classList.add("buttonsGrid");
        container.append(buttonsGrid);

        const answer_1 = document.createElement("button");
        answer_1.id = "1";
        answer_1.classList.add("buttonH");
        answer_1.innerHTML = this.questions[i].answers[0];
        buttonsGrid.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.id = "2";
        answer_2.classList.add("buttonH");
        answer_2.innerHTML = this.questions[i].answers[1];
        buttonsGrid.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.id = "3";
        answer_3.classList.add("buttonH");
        answer_3.innerHTML = this.questions[i].answers[2];
        buttonsGrid.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.id = "4";
        answer_4.classList.add("buttonH");
        answer_4.innerHTML = this.questions[i].answers[3];
        buttonsGrid.appendChild(answer_4);

        const next = document.createElement("button");
        next.classList.add("full-width");
        next.innerHTML = "Next"
        next.hidden = true;
        buttonsGrid.appendChild(next);

        question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';

        let lives = 3;
        let score = 0;

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === correct_answer){
                console.log("Tacan");
                next.hidden = false;
                answer_1.disabled = true;
                answer_2.disabled = true;
                answer_3.disabled = true;
                answer_4.disabled = true;
                clickedButton.style.backgroundColor = "#006466";
                sessionStorage.setItem('clicked', clickedButton.id);
                score+=this.questions[i].difficulty;
                scoreText.innerHTML = "Score: "+String(score);
            }
            else if(clickedButton.innerHTML === "Next"){
                next.hidden = true;
                if(lives == 0){
                    this.Clear();
                    this.CreateGameOver(score);
                }
                else{
                    this.questions.splice(i, 1);
                    if(this.questions.length > 0){
                        i = Math.floor(Math.random() * this.questions.length);
                        //Return the color of the button to normal
                        const clickedID : any = sessionStorage.getItem('clicked');
                        const clicked : any = document.getElementById(clickedID);
                        if(clicked instanceof HTMLButtonElement)
                            clicked.style.backgroundColor = "#6D7476";
                        correct_answer = this.questions[i].correct_answer;
                        question.innerHTML = this.questions[i].question;
                        answer_1.innerHTML = this.questions[i].answers[0];
                        answer_2.innerHTML = this.questions[i].answers[1];
                        answer_3.innerHTML = this.questions[i].answers[2];
                        answer_4.innerHTML = this.questions[i].answers[3];
                        question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';
                    }
                    else{
                        this.Clear();
                        this.CreateGameOver(score);
                    }
                }
                answer_1.disabled = false;
                answer_2.disabled = false;
                answer_3.disabled = false;
                answer_4.disabled = false;

            }
            else{
                console.log("Netacan");
                next.hidden = false;
                lives--;
                livesText.innerHTML = "Lives: "+String(lives);
                answer_1.disabled = true;
                answer_2.disabled = true;
                answer_3.disabled = true;
                answer_4.disabled = true;
                clickedButton.style.backgroundColor = "#780C0C";
                sessionStorage.setItem('clicked', clickedButton.id);
            }
        })
    }

    async CreateGameOver(score: number) {

        const containerGO = document.createElement("div");
        containerGO.classList.add("containerGO");
        this.mainDiv.appendChild(containerGO);

        const pointsText = document.createElement("p");
        pointsText.classList.add("pointsText");
        pointsText.innerHTML = "You earned: "+String(score)+ " points!";
        containerGO.appendChild(pointsText);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard

        const response = await fetch("src/data/scoreboard.json");
        const scoreboard: ScoreboardI = await response.json();

        let i = 0; 
        let found = false;
        let foundIndex = 0;

        for(i;i<5;i++){
            if(scoreboard.items[i].score<score){
                found=true;
                foundIndex=i;
                i = 5;
            }
        }

        const middleRow = document.createElement("div");
        middleRow.classList.add("middleRow");
        containerGO.appendChild(middleRow);

        const inputName = document.createElement("input");
        inputName.classList.add("inputGO");
        inputName.hidden = true;
        middleRow.appendChild(inputName);

        const enterName = document.createElement("button");
        enterName.classList.add("buttonIGO");
        enterName.hidden = true;
        enterName.innerHTML = "Enter";
        middleRow.appendChild(enterName);

        if(found){
            inputName.hidden = false;
            enterName.hidden = false;
        }

        const bottomRow = document.createElement("div");
        bottomRow.classList.add("buttonsGrid");
        containerGO.appendChild(bottomRow);

        const home = document.createElement("button");
        home.classList.add("buttonGO");
        home.innerHTML = "Home";
        bottomRow.appendChild(home);

        const anotherRound = document.createElement("button");
        anotherRound.classList.add("buttonGO");
        anotherRound.innerHTML = "Another Round";
        bottomRow.appendChild(anotherRound);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === "Home"){
                this.Clear();
                this.CreateHome();
            }
            else if(clickedButton.innerHTML === "Another Round")
                this.CreateQuiz();
            else if(clickedButton.innerHTML === "Enter"){
                inputName.hidden = true;
                enterName.hidden = true;
            fetch(`http://localhost:3000/items/${foundIndex+1}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: inputName.value, score: score}),
              })
              i = foundIndex;
              for(i;i<4;i++){
                fetch(`http://localhost:3000/items/${i+2}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({name: scoreboard.items[i].name, score: scoreboard.items[i].score}),
                  })
              }
              this.Clear();
              this.CreateHome();
        }
        })
    }

    async CreateScoreboard(){
        this.Clear();

        const response = await fetch("src/data/scoreboard.json");
        const scoreboard: ScoreboardI = await response.json();

        let scoreboardQ: Scoreboard[] = [];
        let scoreboardQP: Scoreboard[] = [];
        let scoreboardLR: Scoreboard[] = [];

        let i = 0;
        for(i;i<scoreboard.items.length;i++){
            if(i<5){
                scoreboardQ.push(scoreboard.items[i]);
            }
            else if(i>=5&&i<10){
                scoreboardQP.push(scoreboard.items[i]);
            }
            else{
                scoreboardLR.push(scoreboard.items[i]);
            }
        }

        const container = document.createElement("div");
        container.classList.add("containerSB");
        this.mainDiv.appendChild(container);

        const title = document.createElement("p");
        title.classList.add("titleTable");
        title.innerHTML = "Quiz";
        container.appendChild(title);
        
        const board = document.createElement("table");
        board.classList.add("board");
        container.appendChild(board);

        const boardHead = document.createElement("thead");
        boardHead.classList.add("boardHead");
        board.appendChild(boardHead);

        const nameHead = document.createElement("th");
        nameHead.classList.add("nameHead");
        nameHead.innerHTML = "Name";
        boardHead.appendChild(nameHead);

        const scoreHead = document.createElement("th");
        scoreHead.classList.add("scoreHead");
        scoreHead.innerHTML = "Score";
        boardHead.appendChild(scoreHead);

        const boardBody = document.createElement("tbody");
        boardBody.classList.add("tbody");
        board.appendChild(boardBody);

        scoreboardQ.forEach(score => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.innerHTML = score.name;
            row.appendChild(nameCell);

            const scoreCell = document.createElement("td");
            scoreCell.innerHTML = String(score.score);
            row.appendChild(scoreCell);

            boardBody.appendChild(row);
        });

        const titleQP = document.createElement("p");
        titleQP.innerHTML = "Quickest Player";
        titleQP.classList.add("titleTable");
        container.appendChild(titleQP);
        
        const boardQP = document.createElement("table");
        boardQP.classList.add("board");
        container.appendChild(boardQP);

        const boardHeadQP = document.createElement("thead");
        boardHeadQP.classList.add("boardHead");
        boardQP.appendChild(boardHeadQP);

        const nameHeadQP = document.createElement("th");
        nameHeadQP.classList.add("nameHead");
        nameHeadQP.innerHTML = "Name";
        boardHeadQP.appendChild(nameHeadQP);

        const scoreHeadQP = document.createElement("th");
        scoreHeadQP.classList.add("scoreHead");
        scoreHeadQP.innerHTML = "Score";
        boardHeadQP.appendChild(scoreHeadQP);

        const boardBodyQP = document.createElement("tbody");
        boardBodyQP.classList.add("tbody");
        boardQP.appendChild(boardBodyQP);

        scoreboardQP.forEach(score => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.innerHTML = score.name;
            row.appendChild(nameCell);

            const scoreCell = document.createElement("td");
            scoreCell.innerHTML = String(score.score);
            row.appendChild(scoreCell);

            boardBodyQP.appendChild(row);
        });

        const dare = document.createElement("p");
        dare.classList.add("dare");
        dare.innerHTML = "I bet you can't finish in all of them times combined: "
        +scoreboardQP.reduce((acc, scoreboard)=>acc + scoreboard.score, 0)+"s";
        container.appendChild(dare);

        const titleLR = document.createElement("p");
        titleLR.innerHTML = "Lightning Round";
        titleLR.classList.add("titleTable");
        container.appendChild(titleLR);
        
        const boardLR = document.createElement("table");
        boardLR.classList.add("board");
        container.appendChild(boardLR);

        const boardHeadLR = document.createElement("thead");
        boardHeadLR.classList.add("boardHead");
        boardLR.appendChild(boardHeadLR);

        const nameHeadLR = document.createElement("th");
        nameHeadLR.classList.add("nameHead");
        nameHeadLR.innerHTML = "Name";
        boardHeadLR.appendChild(nameHeadLR);

        const scoreHeadLR = document.createElement("th");
        scoreHeadLR.classList.add("scoreHead");
        scoreHeadLR.innerHTML = "Score";
        boardHeadLR.appendChild(scoreHeadLR);

        const boardBodyLR = document.createElement("tbody");
        boardBodyLR.classList.add("tbody");
        boardLR.appendChild(boardBodyLR);

        scoreboardLR.forEach(score => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.innerHTML = score.name;
            row.appendChild(nameCell);

            const scoreCell = document.createElement("td");
            scoreCell.innerHTML = String(score.score);
            row.appendChild(scoreCell);

            boardBodyLR.appendChild(row);
        });

        const home = document.createElement("button");
        home.classList.add("buttonH");
        home.innerHTML = "Home";
        container.appendChild(home);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            this.Clear();
            this.CreateHome();
        })
    }

    async CreateLightningRound(){
        this.Clear();

        let lastAnswer = "";
        let score = 0;

        const container = document.createElement("div");
        container.classList.add("container");
        this.mainDiv.appendChild(container);

        const question = document.createElement("p");
        question.hidden = true;
        question.classList.add("question");
        container.appendChild(question);

        const go = document.createElement("button");
        go.classList.add('buttonH');
        go.innerHTML = "Go!"
        container.appendChild(go);

        const buttonsGrid = document.createElement("div");
        buttonsGrid.classList.add("buttonsGrid");
        container.append(buttonsGrid);

        const answer_1 = document.createElement("button");
        answer_1.hidden = true;
        answer_1.classList.add("buttonH");
        buttonsGrid.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.hidden = true;
        answer_2.classList.add("buttonH");
        buttonsGrid.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.hidden = true;
        answer_3.classList.add("buttonH");
        buttonsGrid.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.hidden = true;
        answer_4.classList.add("buttonH");
        buttonsGrid.appendChild(answer_4);

        question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';

        const response = await fetch("src/data/questions.json");
        this.questions = await response.json();

        const callBack = (scorE: number) => {
            this.CreateLRGameOver(scorE);
        }

        const timer$ = timer(25000); //Koliko traje runda
        const click$ = fromEvent(this.mainDiv, "click").pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement)
        )
        
        const merged$= click$.pipe(
            switchMap((clicK)=>{
                const clickANDtime$ = merge(of(clicK), timer(5000, 5000));
                return clickANDtime$;
            })
        )

        this.lightningQuestion$ = merged$.pipe(takeUntil(timer$));

        fromEvent(go, "click").subscribe({
            next: ()=>{
                go.hidden = true;
                question.hidden = false;
                answer_1.hidden = false;
                answer_2.hidden = false;
                answer_3.hidden = false;
                answer_4.hidden = false;
            this.lightningQuestion$.subscribe({
                next: (event)=>{
                    if(event instanceof HTMLButtonElement){
                        if(event.innerHTML === lastAnswer){
                            score++;
                            console.log(`Score is: ${score}`);
                        }
                    }
                    let i = Math.floor(Math.random() * this.questions.length);
                    console.log(this.questions[i]);
                    question.innerHTML = this.questions[i].question;
                    answer_1.innerHTML = this.questions[i].answers[3]
                    answer_2.innerHTML = this.questions[i].answers[0];
                    answer_3.innerHTML = this.questions[i].answers[1];
                    answer_4.innerHTML = this.questions[i].answers[2];
                    question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';
                    console.log((new Date()).getSeconds());
                    const lastQuestion = this.questions.splice(i, 1);
                    lastAnswer = lastQuestion[0].correct_answer;
                },
                complete() {
                    callBack(score);
                }
            })}
        })   
    }

    async CreateLRGameOver(score: number) {
        this.Clear();

        const containerGO = document.createElement("div");
        containerGO.classList.add("containerGO");
        this.mainDiv.appendChild(containerGO);

        const scoreText = document.createElement("p");
        scoreText.classList.add("pointsText");
        scoreText.innerHTML = "You answered correctly "+ String(score) + " questions";
        containerGO.appendChild(scoreText);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard

        const response = await fetch("src/data/scoreboard.json");
        const scoreboard: ScoreboardI = await response.json();

        let i = 10; 
        let found = false;
        let foundIndex = 0;

        for(i;i<15;i++){
            if(scoreboard.items[i].score<score){
                found=true;
                foundIndex=i;
                i=15;
            }
        }

        const middleRow = document.createElement("div");
        middleRow.classList.add("middleRow");
        containerGO.appendChild(middleRow);

        const inputName = document.createElement("input");
        inputName.classList.add("inputGO");
        inputName.hidden = true;
        middleRow.appendChild(inputName);

        const enterName = document.createElement("button");
        enterName.classList.add("buttonIGO");
        enterName.hidden = true;
        enterName.innerHTML = "Enter";
        middleRow.appendChild(enterName);

        if(found){
            inputName.hidden = false;
            enterName.hidden = false;
        }

        const bottomRow = document.createElement("div");
        bottomRow.classList.add("buttonsGrid");
        containerGO.appendChild(bottomRow);

        const home = document.createElement("button");
        home.classList.add("buttonGO");
        home.innerHTML = "Home";
        bottomRow.appendChild(home);

        const anotherRound = document.createElement("button");
        anotherRound.classList.add("buttonGO");
        anotherRound.innerHTML = "Another Round";
        bottomRow.appendChild(anotherRound);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === "Home"){
                this.Clear();
                this.CreateHome();    
            }
            else if(clickedButton.innerHTML === "Another Round")
                this.CreateLightningRound();
            else if(clickedButton.innerHTML === "Enter"){
                inputName.hidden = true;
                enterName.hidden = true;
            fetch(`http://localhost:3000/items/${foundIndex+1}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: inputName.value, score: score}),
              })
              i = foundIndex;
              for(i;i<14;i++){
                fetch(`http://localhost:3000/items/${i+2}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({name: scoreboard.items[i].name, score: scoreboard.items[i].score}),
                  })
              }
              this.Clear();
              this.CreateHome();
            }
        })
    }

    async CreateQuickestPlayer() {
        this.Clear();

        const container = document.createElement("div");
        container.classList.add("container");
        this.mainDiv.appendChild(container);

        const go = document.createElement("button");
        go.classList.add('buttonH');
        go.innerHTML = "Go!"
        container.appendChild(go);

        const question = document.createElement("p");
        question.hidden = true;
        question.classList.add("question");
        container.appendChild(question);

        const buttonsGrid = document.createElement("div");
        buttonsGrid.classList.add("buttonsGrid");
        container.append(buttonsGrid);

        const answer_1 = document.createElement("button");
        answer_1.hidden = true;
        answer_1.classList.add("buttonH");
        buttonsGrid.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.hidden = true;
        answer_2.classList.add("buttonH");
        buttonsGrid.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.hidden = true;
        answer_3.classList.add("buttonH");
        buttonsGrid.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.hidden = true;
        answer_4.classList.add("buttonH");
        buttonsGrid.appendChild(answer_4);

        question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';

        const response = await fetch("src/data/questions.json");
        this.questions = await response.json();

        let lastAnswer = "";
        let time : Date;
        let lastEvent: HTMLButtonElement;
        let work = true;

        const callBack = (timE: number, finished: boolean) => {
            this.CreateQPGameOver(timE, finished);
        }

        const click$ = fromEvent(this.mainDiv, "click").pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
            take(11)
        )

        const clickSub = click$.subscribe({
            next: (event)=>{
                if(event instanceof HTMLButtonElement){
                    if(event.innerHTML !== lastAnswer && event.innerHTML !== "Go!"){
                        work = false;
                        clickSub.unsubscribe();
                        callBack(0, false); 
                    }
                    else if(event.innerHTML === "Go!"){
                        go.hidden = true;
                        question.hidden = false;
                        answer_1.hidden = false;
                        answer_2.hidden = false;
                        answer_3.hidden = false;
                        answer_4.hidden = false;
                        time = new Date();
                    }
                }
                let i = Math.floor(Math.random() * this.questions.length);
                console.log(this.questions[i]);
                question.innerHTML = this.questions[i].question;
                answer_1.innerHTML = this.questions[i].answers[3]
                answer_2.innerHTML = this.questions[i].answers[0];
                answer_3.innerHTML = this.questions[i].answers[1];
                answer_4.innerHTML = this.questions[i].answers[2];
                question.style.maxWidth = String(buttonsGrid.offsetWidth) + 'px';
                const lastQuestion = this.questions.splice(i, 1);
                    lastAnswer = lastQuestion[0].correct_answer;
                    lastEvent = event;
            },
            complete() {
                if(work){
                    console.log("Kraj: "+(new Date()).getSeconds());
                    console.log("Pocetak: "+time.getSeconds());
                    let differnce: number = (new Date()).getSeconds() - time.getSeconds();
                    console.log("P "+differnce);
                    if(differnce<0){
                        differnce = (new Date()).getSeconds() + 60 - time.getSeconds();
                        console.log("N "+differnce);
                    }
                    let minutes = (new Date()).getMinutes() - time.getMinutes();
                    if(time.getSeconds()!==0 && (new Date()).getSeconds()===0){
                        minutes--;
                        console.log("Smanjeni minuti "+minutes);
                    }
                    if(minutes>0/*minutes!==1 || ((new Date()).getSeconds() - time.getSeconds())>0*/){
                        if((new Date()).getSeconds()<time.getSeconds())
                            minutes--;
                        console.log("Dodati minuti "+ minutes);
                        differnce+=minutes*60;
                    }
                    else if(differnce===0)
                        differnce=60;
                    console.log("Z " + differnce);
                    callBack(differnce, true);
                }
            }
        })
    }

    async CreateQPGameOver(time: number, finished: boolean) {
        this.Clear();

        const containerGO = document.createElement("div");
        containerGO.classList.add("containerGO");
        this.mainDiv.appendChild(containerGO);

        const scoreText = document.createElement("p");
        scoreText.classList.add("pointsText");
        if(finished)
            scoreText.innerHTML = "Congratulations! You finished in "+ String(time)+ " seconds";
        else
            scoreText.innerHTML = "You failed miserably!";
        containerGO.appendChild(scoreText);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard
        const response = await fetch("src/data/scoreboard.json");
        const scoreboard: ScoreboardI = await response.json();

        let i = 5; 
        let found = false;
        let foundIndex = 0;

        for(i;i<10;i++){
            if(scoreboard.items[i].score>time){
                found=true;
                foundIndex=i;
                i=10;
            }
        }

        const middleRow = document.createElement("div");
        middleRow.classList.add("middleRow");
        containerGO.appendChild(middleRow);

        const inputName = document.createElement("input");
        inputName.classList.add("inputGO");
        inputName.hidden = true;
        middleRow.appendChild(inputName);

        const enterName = document.createElement("button");
        enterName.classList.add("buttonIGO");
        enterName.hidden = true;
        enterName.innerHTML = "Enter";
        middleRow.appendChild(enterName);

        if(found && scoreText.innerHTML !== "You failed miserably!"){
            inputName.hidden = false;
            enterName.hidden = false;
        }

        const bottomRow = document.createElement("div");
        bottomRow.classList.add("buttonsGrid");
        containerGO.appendChild(bottomRow);

        const home = document.createElement("button");
        home.classList.add("buttonGO");
        home.innerHTML = "Home";
        bottomRow.appendChild(home);

        const anotherRound = document.createElement("button");
        anotherRound.classList.add("buttonGO");
        anotherRound.innerHTML = "Another Round";
        bottomRow.appendChild(anotherRound);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === "Home"){
                this.Clear();
                this.CreateHome();    
            }
            else if(clickedButton.innerHTML === "Another Round")
                this.CreateQuickestPlayer();
            else if(clickedButton.innerHTML === "Enter"){
                inputName.hidden = true;
                enterName.hidden = true;
            fetch(`http://localhost:3000/items/${foundIndex+1}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({name: inputName.value, score: time}),
              })
              i = foundIndex;
              for(i;i<9;i++){
                fetch(`http://localhost:3000/items/${i+2}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({name: scoreboard.items[i].name, score: scoreboard.items[i].score}),
                  })
              }
              this.Clear();
              this.CreateHome();
            }
        })
    }

    shuffleArray(array: Name[]): Name[] {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
          const randomIndex = Math.floor(Math.random() * (i + 1));
          [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
        }
        return shuffledArray;
    }

    async CreateRandomNameGenerator(){
        this.Clear();

        const container = document.createElement("div");
        container.classList.add("containerNG");
        this.mainDiv.appendChild(container);

        let response = await fetch("src/data/first.json");
        let first: Name[] = await response.json();
        first = this.shuffleArray(first);
        const first$ = of(first);

        response = await fetch("src/data/last.json");
        let last: Name[] = await response.json();
        last = this.shuffleArray(last);
        const last$ = of(last);

        zip(first$, last$).pipe(
            map(([f, l]) => ({f, l}))
        ).subscribe({
            next: (value)=>{
                let i = 0;
                for(i;i<first.length;i++){
                    const name = document.createElement("p");
                    name.innerHTML = value.f[i].name + " " + value.l[i].name;
                    name.classList.add("name");
                    container.appendChild(name);
                }
            },
            complete: ()=>{

                const buttonsGrid = document.createElement("div");
                buttonsGrid.classList.add("buttonsGridNG");
                container.append(buttonsGrid);

                const onceAgain = document.createElement("button");
                onceAgain.classList.add("buttonH");
                onceAgain.innerHTML = "Generate";
                buttonsGrid.append(onceAgain);
        
                const home = document.createElement("button");
                home.classList.add("buttonH");
                home.innerHTML = "Home";
                buttonsGrid.append(home);
            }
        })

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === "Home"){
                this.Clear();
                this.CreateHome();    
            }
            else if(clickedButton.innerHTML === "Generate"){
                this.CreateRandomNameGenerator()
            }
        })
    }
}