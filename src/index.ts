import { Game } from "./app/Game";

const container = document.createElement("div");
container.classList.add("main");
document.body.prepend(container);

const app = new Game(container);
app.CreateHome();