import { Observable, Subscription, filter, fromEvent, map } from "rxjs";
import { Question } from "./Question";
import { Scoreboard } from "./Scoreboard";

export class Game{
    mainDiv: HTMLDivElement
    click$: Observable<Event>;
    clickSub: Subscription;
    questions: Question[];

    constructor(mainDiv: HTMLDivElement) {
        this.mainDiv = mainDiv;
        this.click$ = fromEvent(this.mainDiv, "click");
    }

    CreateHome(){
        const title = document.createElement("h1");
        title.classList.add("title");
        title.innerHTML = "90's Hip Hop Quiz";
        this.mainDiv.appendChild(title);

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

}