import { Component } from '@angular/core';
import {CalculTransitaireComponent} from './calcul-transitaire/calcul-transitaire.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalculTransitaireComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
