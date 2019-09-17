import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  items = [];

  @Input('title') title: string;
  @Input('name') name: string;
  @Input('allowDone') allowDone: boolean;
  @Input('allowCrit') allowCrit: boolean;
  @Input('allowLater') allowLater: boolean;
  loading = true;
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore,
              private alertCtrl: AlertController, ) { }

  ngOnInit() {
    console.log(this.name);
    this.afAuth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${this.name}`, ref => {
        return ref.orderBy('pos', 'desc');
      }).snapshotChanges().subscribe(colSnap => {
        this.items = [];
        console.log(colSnap.length);
        colSnap.forEach(a => {
          const item = a.payload.doc.data();
          item['id'] = a.payload.doc.id;
          this.items.push(item);
        });
        this.loading = false;
      });
    });
  }

  async add() {
    const alert = await this.alertCtrl.create({
      header: 'New Task',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'OK',
          handler: (val) => {
            console.log(`${this.afAuth.auth.currentUser.uid}`);
            const now = new Date();
            const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
            now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
            this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${this.name}`).add({
              text: val.task,
              pos:  this.items.length ? this.items[0].pos + 1 : 0,
              created: nowUtc,
            });
          }

        }
      ],
      inputs: [
        {
          name: 'task',
          type: 'text',
          placeholder: 'Next task'
        }
      ]
    });
    return await alert.present();
  }

  delete(item) {
    this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${this.name}/${item.id}`).delete();
  }

  crit(item) {
    this.moveItem(item, 'crit');
  }
  later(item) {
    this.moveItem(item, 'later');
  }

  complete(item) {
    this.moveItem(item, 'done');

  }

  moveItem(item, list: string) {
    this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${this.name}/${item.id}`).delete();
    const id = item.id;
    delete item.id;
    this.db.collection(`users/${this.afAuth.auth.currentUser.uid}/${list}`, ref => {
      return ref.orderBy('pos', 'desc').limit(1);
    }).get().toPromise().then(qSnap => {
      qSnap.forEach( a => {
        item.pos = 0;
        item.pos = a.data().pos + 1;
      });
      this.db.doc(`users/${this.afAuth.auth.currentUser.uid}/${list}/${id}`).set(item);
    });
  }

}
