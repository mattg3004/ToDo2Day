import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crit',
  templateUrl: './crit.page.html',
  styleUrls: ['./crit.page.scss'],
})
export class CritPage implements OnInit {
  items = [{
    text: 'test',
    created: new Date(),
    pos : 0,
  }]
  constructor() { }

  ngOnInit() {
  }

}
