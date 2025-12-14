import { Component } from '@angular/core';
import {Article} from '../models/article.model';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DeviseFormatterPipe} from '../pipe/devise-formatter.pipe';
import Swal from 'sweetalert2';
import {faPrint} from '@fortawesome/free-solid-svg-icons';
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

  protected readonly faPrint = faPrint;

  genererArticles() {
    this.articles = Array.from({ length: this.nombreArticles }, () => ({
      position: '',
      fob: 0
    }));
  }

  get valeurCaf(): number {
    return (this.fobTotal || 0) + (this.fretTotal || 0) + (this.assTotal || 0) + (this.autresFraisTotal || 0);
  }

  // Calcul du FOB saisi en temps réel
  get fobSaisi(): number {
    return this.articles.reduce((sum, a) => sum + Number(a.fob || 0), 0);
  }

  // FOB restant à saisir
  get fobRestant(): number {
    return this.fobTotal - this.fobSaisi;
  }

  // Pourcentage du FOB saisi
  get pourcentageFobSaisi(): number {
    if (this.fobTotal === 0) return 0;
    return (this.fobSaisi / this.fobTotal) * 100;
  }

  calculer() {
    if (this.fobTotal === 0) return;

    const totalFOBArticles = this.articles.reduce((sum, a) => sum + Number(a.fob || 0), 0);
    if (totalFOBArticles > this.fobTotal) {
      Swal.fire({
        icon: 'error',
        title: 'FOB dépassé',
        text: `La somme des FOB saisis (${this.formatNumber(totalFOBArticles)}) dépasse le FOB TOTAL (${this.formatNumber(this.fobTotal)}) !`,
        confirmButtonColor: '#2563eb',
      });
      return;

    }if (totalFOBArticles < this.fobTotal) {
      Swal.fire({
        icon: 'error',
        title: 'FOB pas atteint',
        text: `La somme des FOB saisis (${totalFOBArticles}) n'atteint pas le FOB TOTAL (${this.fobTotal}) !`,
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
    pdfContent.style.width = '100%';
    pdfContent.style.maxWidth = '800px'; // Limiter la largeur pour améliorer la lisibilité
    pdfContent.style.margin = '0 auto';

    const title = document.createElement('h1');
    title.textContent = 'Calcul - Transitaire';
    title.style.fontSize = '32px';
    title.style.marginBottom = '25px';
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    pdfContent.appendChild(title);

    // Ajouter la section des totaux
    const totalsSection = document.createElement('div');
    totalsSection.innerHTML = `
    <h2 style="font-size: 26px; margin-bottom: 15px; font-weight: bold;">Totaux</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tr>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">FOB TOTAL</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.fobTotal)} FCFA</td>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">FRET TOTAL</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.fretTotal)} FCFA</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">ASS TOTAL</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.assTotal)} FCFA</td>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">AUTRES FRAIS</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.autresFraisTotal)} FCFA</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">POIDS TOTAL</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.poidsTotal)} KG</td>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">NOMBRE DE COLIS</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.colisTotal)} Colis</td>
      </tr>
      <tr>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">VALEUR CAF</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.valeurCaf)} FCFA</td>
        <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 16px; background-color: #f8f8f8;">NOMBRE D'ARTICLES</th>
        <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 16px;">${this.formatNumber(this.nombreArticles)}</td>
      </tr>
    </table>
  `;
    pdfContent.appendChild(totalsSection);

    // Ajouter le tableau des articles
    if (this.articles.length > 0) {
      const articlesSection = document.createElement('div');
      articlesSection.innerHTML = `
      <h2 style="font-size: 26px; margin-bottom: 15px; font-weight: bold;">Articles</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 15px; font-weight: bold;">#</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 15px; font-weight: bold;">Position</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">FOB</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">FRET</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">ASS</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">Autres</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">Poids</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 15px; font-weight: bold;">Colis</th>
          </tr>
        </thead>
        <tbody>
          ${this.articles.map((article, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; font-size: 14px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 10px; font-size: 14px;">${article.position}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.fob)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.fret)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.ass)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.autresFrais)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.poids)}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-size: 14px;">${this.formatNumber(article.colis)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
      pdfContent.appendChild(articlesSection);
    }

    // Ajouter la date et l'heure d'exportation
    const dateSection = document.createElement('div');
    dateSection.innerHTML = `
    <p style="margin-top: 20px; font-size: 14px; text-align: right; font-style: italic;">
      Exporté le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    </p>
  `;
    pdfContent.appendChild(dateSection);

    // Ajouter le contenu temporaire au document
    document.body.appendChild(pdfContent);

    // Utiliser html2canvas
    html2canvas(pdfContent, {
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      // Créer un nouveau document PDF avec marges réduites
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculer les dimensions pour garder le ratio
      const imgWidth = pageWidth - 10; // 5mm de marge de chaque côté
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 5; // Début avec une marge de 5mm en haut

      // Ajouter l'image de la première page
      pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 10); // 5mm de marge haut et bas

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5; // +5 pour la marge supérieure
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 10);
      }

      // Télécharger le PDF avec un nom basé sur la date et l'heure
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // AAAAMMJJ
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
      pdf.save(`calcul-transitaire-${dateStr}-${timeStr}.pdf`);

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
