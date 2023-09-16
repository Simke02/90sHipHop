import { Observable, Subscription, filter, fromEvent, interval, map, mapTo, merge, mergeMap, of, startWith, switchMap, take, takeUntil, timer } from "rxjs";
import { Question } from "./Question";
import { Scoreboard } from "./Scoreboard";

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
        const title = document.createElement("h1");
        title.classList.add("title");
        title.innerHTML = "90's Hip Hop Quiz";
        this.mainDiv.appendChild(title);

        const lightningButton = document.createElement("button");
        lightningButton.classList.add("lightning");
        lightningButton.innerHTML = "Lightning Round";
        this.mainDiv.appendChild(lightningButton);

        const quickestButton = document.createElement("button");
        quickestButton.classList.add("quickest");
        quickestButton.innerHTML = "Quickest Player";
        this.mainDiv.appendChild(quickestButton);

        const startButton = document.createElement("button");
        startButton.classList.add("start");
        startButton.innerHTML = "Start";
        this.mainDiv.appendChild(startButton);

        const scoreboardButton = document.createElement("button");
        scoreboardButton.classList.add("scoreboard");
        scoreboardButton.innerHTML = "Scoreboard"
        this.mainDiv.appendChild(scoreboardButton);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.className === "start")
                this.CreateQuiz();
            else if(clickedButton.className === "scoreboard")
                this.CreateScoreboard();
            else if(clickedButton.className === "lightning")
                this.CreateLightningRound();
            else if(clickedButton.className === "quickest")
                this.CreateQuickestPlayer();
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

        const question = document.createElement("p");
        question.classList.add("question");
        question.innerHTML = this.questions[0].question;
        this.mainDiv.appendChild(question);

        const answer_1 = document.createElement("button");
        answer_1.classList.add("answer_1");
        answer_1.innerHTML = this.questions[0].answers[0];
        this.mainDiv.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.classList.add("answer_2");
        answer_2.innerHTML = this.questions[0].answers[1];
        this.mainDiv.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.classList.add("answer_3");
        answer_3.innerHTML = this.questions[0].answers[2];
        this.mainDiv.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.classList.add("answer_4");
        answer_4.innerHTML = this.questions[0].answers[3];
        this.mainDiv.appendChild(answer_4);

        const next = document.createElement("button");
        next.classList.add("next");
        next.innerHTML = "Next"
        next.hidden = true;
        this.mainDiv.appendChild(next);

        let lives = 3;
        let score = 0;

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === this.questions[0].correct_answer){
                console.log("Tacan");
                next.hidden = false;
                answer_1.disabled = true;
                answer_2.disabled = true;
                answer_3.disabled = true;
                answer_4.disabled = true;
            }
            else if(clickedButton.innerHTML === "Next"){
                next.hidden = true;
                if(lives == 0){
                    this.Clear();
                    this.CreateGameOver(score);
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
                console.log(lives);
                answer_1.disabled = true;
                answer_2.disabled = true;
                answer_3.disabled = true;
                answer_4.disabled = true;
            }
        })
    }

    CreateGameOver(score: number) {
        const pointsText = document.createElement("p");
        pointsText.classList.add("pointsText");
        pointsText.innerHTML = "You earned: ";
        this.mainDiv.appendChild(pointsText);

        const pointsNumber = document.createElement("p");
        pointsNumber.classList.add("pointsNumber");
        pointsNumber.innerHTML = String(score) + " points!";
        this.mainDiv.appendChild(pointsNumber);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard

        const home = document.createElement("button");
        home.classList.add("home");
        home.innerHTML = "Home";
        this.mainDiv.appendChild(home);

        this.clickSub = this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            this.Clear();
            this.CreateHome();
        })
    }

    async CreateScoreboard(){
        this.Clear();

        const response = await fetch("src/data/scoreboard.json");
        const scoreboard: Scoreboard[] = await response.json();
        
        const board = document.createElement("table");
        board.classList.add("board");
        this.mainDiv.appendChild(board);

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

        scoreboard.forEach(score => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.innerHTML = score.name;
            row.appendChild(nameCell);

            const scoreCell = document.createElement("td");
            scoreCell.innerHTML = String(score.score);
            row.appendChild(scoreCell);

            boardBody.appendChild(row);
        });

        const home = document.createElement("button");
        home.classList.add("home");
        home.innerHTML = "Home";
        this.mainDiv.appendChild(home);

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

        const question = document.createElement("p");
        question.hidden = true;
        question.classList.add("question");
        this.mainDiv.appendChild(question);

        const go = document.createElement("button");
        go.classList.add('go');
        go.innerHTML = "Go!"
        this.mainDiv.appendChild(go);

        const answer_1 = document.createElement("button");
        answer_1.hidden = true;
        answer_1.classList.add("answer_1");
        this.mainDiv.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.hidden = true;
        answer_2.classList.add("answer_2");
        this.mainDiv.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.hidden = true;
        answer_3.classList.add("answer_3");
        this.mainDiv.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.hidden = true;
        answer_4.classList.add("answer_4");
        this.mainDiv.appendChild(answer_4);

        const response = await fetch("src/data/questions.json");
        this.questions = await response.json();

        const callBack = (scorE: number) => {
            this.CreateLRGameOver(scorE);
        }

        const timer$ = timer(10000); //Koliko traje runda
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

    CreateLRGameOver(score: number) {
        this.Clear();

        const scoreText = document.createElement("p");
        scoreText.classList.add("scoreText");
        scoreText.innerHTML = "You answered correctly "+ String(score)+ " questions";
        this.mainDiv.appendChild(scoreText);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard

        const home = document.createElement("button");
        home.classList.add("home");
        home.innerHTML = "Home";
        this.mainDiv.appendChild(home);

        const anotherRound = document.createElement("button");
        anotherRound.classList.add("anotherRound");
        anotherRound.innerHTML = "Another Round";
        this.mainDiv.appendChild(anotherRound);

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
        })
    }

    async CreateQuickestPlayer() {
        this.Clear();

        const go = document.createElement("button");
        go.classList.add('go');
        go.innerHTML = "Go!"
        this.mainDiv.appendChild(go);

        const question = document.createElement("p");
        question.hidden = true;
        question.classList.add("question");
        this.mainDiv.appendChild(question);

        const answer_1 = document.createElement("button");
        answer_1.hidden = true;
        answer_1.classList.add("answer_1");
        this.mainDiv.appendChild(answer_1);

        const answer_2 = document.createElement("button");
        answer_2.hidden = true;
        answer_2.classList.add("answer_2");
        this.mainDiv.appendChild(answer_2);

        const answer_3 = document.createElement("button");
        answer_3.hidden = true;
        answer_3.classList.add("answer_3");
        this.mainDiv.appendChild(answer_3);

        const answer_4 = document.createElement("button");
        answer_4.hidden = true;
        answer_4.classList.add("answer_4");
        this.mainDiv.appendChild(answer_4);

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
                    if(minutes!==1 || ((new Date()).getSeconds() - time.getSeconds())>0){
                        if(minutes !== 0 )
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

        const scoreText = document.createElement("p");
        scoreText.classList.add("scoreText");
        if(finished)
            scoreText.innerHTML = "Congratulations! You finished in "+ String(time)+ " seconds";
        else
            scoreText.innerHTML = "You failed bitch ass nigga!";
        this.mainDiv.appendChild(scoreText);

        // Ako je ostvario dovoljno poena unesi ime za Scoreboard
        const response = await fetch("src/data/scoreboardQP.json");
        const scoreboard: Scoreboard[] = await response.json();

        let i = 0; 
        let found = false;
        let foundIndex = 0;

        for(i;i<scoreboard.length;i++){
            if(scoreboard[i].score>time){
                found=true;
                foundIndex=i;
                i=scoreboard.length;
            }
        }

        const inputName = document.createElement("input");
        inputName.classList.add("inputName");
        inputName.hidden = true;
        this.mainDiv.appendChild(inputName);

        const enterName = document.createElement("button");
        enterName.classList.add("enterName");
        enterName.hidden = true;
        enterName.innerHTML = "Enter";
        this.mainDiv.appendChild(enterName);

        if(found){
            inputName.hidden = false;
            enterName.hidden = false;
        }

        const home = document.createElement("button");
        home.classList.add("home");
        home.innerHTML = "Home";
        this.mainDiv.appendChild(home);

        const anotherRound = document.createElement("button");
        anotherRound.classList.add("anotherRound");
        anotherRound.innerHTML = "Another Round";
        this.mainDiv.appendChild(anotherRound);

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
                scoreboard.splice(foundIndex, 0, new Scoreboard(inputName.innerHTML, time))
                scoreboard.pop();
                inputName.hidden = true;
                enterName.hidden = true;
                /*fetch("src/data/scoreboardQP.json", {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(scoreboard),
                  })*/
            }
        })
    }
}