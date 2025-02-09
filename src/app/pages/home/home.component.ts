import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { Participation } from 'src/app/core/models/Participation';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public numberOfJOs$: Observable<number> = of(0); // observable for number of JOs
  public olympics$: Observable<OlympicCountry[] | null> = of(null); // observable for raw data
  public pieChartData$: Observable<{ name: string; value: number }[]> = of([]); // observable for pie chart data

  // configuration for ngx-charts
  view: [number, number] = [700, 400];

  // options for ngx-charts
  gradient: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';
  colorScheme: string = 'cool';

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.fetchNumberOfJOs();
    this.fetchData();
  }

  // fetch number of JOs
  fetchNumberOfJOs(): void {
    this.numberOfJOs$ = this.olympicService.loadInitialData().pipe(
      map((data: OlympicCountry[] | null) => {
        return this.getUniqueYearsOfJOs(data);
      }),
      catchError((error) => {
        console.error('Error while fetching data:', error);
        return of(0); // return 0 in case of error
      })
    );
  }

  private getUniqueYearsOfJOs(data: OlympicCountry[] | null): number {
    if (!data) return 0; // return 0 if no data
    const yearsOfAllJOs = data.flatMap((country) => country.participations.map((participation) => participation.year));
    return new Set(yearsOfAllJOs).size; // provides the number of unique years of all JOs
  }

  // fetch data for pie chart
  fetchData(): void {
    this.pieChartData$ = this.olympicService.loadInitialData().pipe(
      map((data: OlympicCountry[] | null) => 
        data 
          ? data.map((country) => ({
              name: country.country,
              value: this.calculateMedals(country.participations),
          }))
          : [] // return empty array if data is null
      ),
      catchError((error) => {
        console.error('Error while fetching data:', error);
        return of([]); // return empty array in case of error
      })
    );
  }

  // sum of medals per country
  private calculateMedals(participations: Participation[]): number {
    return participations.reduce((total, participation) => total + participation.medalsCount, 0);
  }

  onSelect(data: { name: string, value: number }): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: { name: string, value: number }): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: { name: string, value: number }): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
