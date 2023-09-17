export class Scoreboard{
    id: number;
    name: string;
    score: number;

    constructor(id: number, name: string, score: number){
        this.id = id;
        this.name = name;
        this.score = score;
    }
}

export class ScoreboardI{
    items: Scoreboard[];
}