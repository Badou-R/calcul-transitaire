import { Component } from '@angular/core';
import {Article} from '../models/article.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DeviseFormatterPipe} from '../pipe/devise-formatter.pipe';
import Swal from 'sweetalert2';
import {faFilePdf, faPrint} from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-calcul-transitaire',
  standalone: true,
  imports: [CommonModule, FormsModule, DeviseFormatterPipe, FaIconComponent],
  providers: [],
  templateUrl: './calcul-transitaire.component.html',
  styleUrl: './calcul-transitaire.component.css'
})
export class CalculTransitaireComponent {
  fobTotal = 0;
  fretTotal = 0;
  assTotal = 0;
  autresFraisTotal = 0;
  poidsTotal = 0;
  colisTotal = 0;
  nombreArticles = 0;

  articles: Article[] = [];

  protected readonly faFilePdf = faFilePdf;
  protected readonly faPrint = faPrint;

  genererArticles() {
    this.articles = Array.from({ length: this.nombreArticles }, () => ({
      position: '',
      fob: 0
    }));
  }

  calculer() {
    if (this.fobTotal === 0) return;

    const totalFOBArticles = this.articles.reduce((sum, a) => sum + Number(a.fob || 0), 0);
    if (totalFOBArticles > this.fobTotal) {
      Swal.fire({
        icon: 'error',
        title: 'FOB dépassé',
        text: `La somme des FOB saisis (${totalFOBArticles}) dépasse le FOB TOTAL (${this.fobTotal}) !`,
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    this.articles = this.articles.map(article => {
      const ratio = article.fob / this.fobTotal;
      return {
        ...article,
        fret: +(this.fretTotal * ratio).toFixed(2),
        ass: +(this.assTotal * ratio).toFixed(2),
        autresFrais: +(this.autresFraisTotal * ratio).toFixed(2),
        poids: +(this.poidsTotal * ratio).toFixed(2),
        colis: +(this.colisTotal * ratio).toFixed(2)
      };
    });

    Swal.fire({
      icon: 'success',
      title: 'Calcul terminé',
      text: 'Les répartitions ont été effectuées avec succès.',
      confirmButtonColor: '#16a34a',
    });
  }

  // Fonction pour exporter en PDF
  exporterPDF() {
    // Créer un élément container temporaire pour le contenu du PDF
    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';

    // Ajouter un titre
    const title = document.createElement('h1');
    title.textContent = 'Calcul - Transitaire';
    title.style.fontSize = '24px';
    title.style.marginBottom = '20px';
    title.style.textAlign = 'center';
    pdfContent.appendChild(title);

    // Ajouter la section des totaux
    const totalsSection = document.createElement('div');
    totalsSection.innerHTML = `
      <h2 style="font-size: 18px; margin-bottom: 10px;">Totaux</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">FOB TOTAL</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.fobTotal)} FCFA</td>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">FRET TOTAL</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.fretTotal)} FCFA</td>
        </tr>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">ASS TOTAL</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.assTotal)} FCFA</td>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">AUTRES FRAIS</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.autresFraisTotal)} FCFA</td>
        </tr>
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">POIDS TOTAL</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.poidsTotal)} KG</td>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">NOMBRE DE COLIS</th>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(this.colisTotal)} Colis</td>
        </tr>
      </table>
    `;
    pdfContent.appendChild(totalsSection);

    // Ajouter le tableau des articles si disponible
    if (this.articles.length > 0) {
      const articlesSection = document.createElement('div');
      articlesSection.innerHTML = `
        <h2 style="font-size: 18px; margin-bottom: 10px;">Articles</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Position</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">FOB</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">FRET</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">ASS</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Autres Frais</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Poids</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Colis</th>
            </tr>
          </thead>
          <tbody>
            ${this.articles.map((article, index) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${article.position}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.fob)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.fret)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.ass)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.autresFrais)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.poids)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${this.formatNumber(article.colis)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      pdfContent.appendChild(articlesSection);
    }

    // Ajouter le contenu temporaire au document
    document.body.appendChild(pdfContent);

    // Utiliser html2canvas pour convertir le contenu en image
    html2canvas(pdfContent, {
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      // Créer un nouveau document PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largeur A4 en mm (moins les marges)
      const pageHeight = 297; // Hauteur A4 en mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Ajouter l'image de la première page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Télécharger le PDF
      const suffix = Date.now();
      const baseName = 'calcul-transitaire'
      pdf.save(`${baseName}_${suffix}.pdf`);

      // Supprimer l'élément temporaire
      document.body.removeChild(pdfContent);
    });
  }

  // Fonction helper pour formater les nombres
  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('fr-FR').format(Number(value.toFixed(0)));
  }

}
