import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { SignOutAction } from "src/app/store/actions";
import { AppState } from "src/app/store/app.state";

@Component({
  templateUrl: "./sign-out.component.html",
  styleUrls: ["./sign-out.component.css"]
})
export class SignOutComponent implements OnInit {
  /**
   * @constructor
   * @param {Store<AppState>} store
   */
  constructor(private store: Store<AppState>, private router: Router) {}

  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  ngOnInit() {
    this.store.dispatch(new SignOutAction());
  }
}
