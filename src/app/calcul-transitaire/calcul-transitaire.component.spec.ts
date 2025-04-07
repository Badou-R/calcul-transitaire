import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculTransitaireComponent } from './calcul-transitaire.component';

describe('CalculTransitaireComponent', () => {
  let component: CalculTransitaireComponent;
  let fixture: ComponentFixture<CalculTransitaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculTransitaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculTransitaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
