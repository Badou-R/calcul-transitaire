import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'deviseFormatter',
  standalone: true
})
export class DeviseFormatterPipe implements PipeTransform {

  transform(value: any, scale: number = 0): string {
    // Vérification de la valeur
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0';
    }

    try {
      // Formatage avec l'API Intl
      let formated = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: scale,
        maximumFractionDigits: scale
      }).format(Number(value));

      // Suppression des symboles de devise en une seule fois avec regex
      formated = formated.replace(/CFA|XOF|F/g, '').trim();

      return formated;
    } catch (error) {
      console.error('Erreur de formatage de devise:', error);
      return value.toString();
    }
  }
}
