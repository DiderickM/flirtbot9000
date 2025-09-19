import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FlirtBot9000';
  flirtHints: string[] = [
    'Ben jij een magneet? Want ik voel me onweerstaanbaar tot je aangetrokken.',
    'Is jouw naam Google? Want jij hebt alles waar ik naar zocht.',
    'Geloof je in liefde op het eerste gezicht, of moet ik nog een keer langslopen?',
    'Als jij een droom was, zou ik nooit meer willen wakker worden.',
    'Jij laat mijn hart sneller kloppen dan koffie op maandagochtend.',
    'Heb je een kaart? Want ik verdwaal in je ogen.',
    'Jij bent de reden dat ik glimlach naar mijn telefoon.',
    'Is jouw vader een dief? Want hij heeft de sterren uit de hemel gestolen en in jouw ogen gestopt.'
  ];
  randomHint: string = '';
  progress: number = 0;
  intervalId: any;
  progressId: any;


  constructor() {
    this.setRandomHint();
    this.startProgress();
    this.intervalId = setInterval(() => {
      this.setRandomHint();
      this.startProgress();
    }, 10000);
  }

  startProgress() {
    this.progress = 0;
    if (this.progressId) clearInterval(this.progressId);
    this.progressId = setInterval(() => {
      if (this.progress < 100) {
        this.progress += 1;
      } else {
        clearInterval(this.progressId);
      }
    }, 100);
  }

  setRandomHint() {
    let newHint;
    do {
      newHint = this.flirtHints[Math.floor(Math.random() * this.flirtHints.length)];
    } while (newHint === this.randomHint && this.flirtHints.length > 1);
    this.randomHint = newHint;
  }
}
