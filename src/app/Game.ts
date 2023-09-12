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

    ClearHome(){
        while(this.mainDiv.firstChild){
            this.mainDiv.removeChild(this.mainDiv.firstChild);
        }
        this.clickSub.unsubscribe();
    }

    async CreateQuiz(){
        this.ClearHome();

        const response = await fetch("src/data/questions.json");
        this.questions = await response.json();
        console.log(this.questions);

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

        this.click$.pipe(
            filter(event => event.target instanceof HTMLButtonElement),
            map(event => event.target as HTMLButtonElement),
        ).subscribe(clickedButton=>{
            if(clickedButton.innerHTML === this.questions[0].correct_answer)
                console.log("Tacan");
            else
                console.log("Netacan");
        })
    }

    async CreateScoreboard(){
        this.ClearHome();

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
    }

}