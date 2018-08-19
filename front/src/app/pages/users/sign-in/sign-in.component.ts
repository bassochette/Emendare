import { appRoutes } from "src/app/config";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { AuthenticateAction } from "src/app/store/actions";
import { AppState } from "src/app/store/app.state";
import { getAuthenticationError, isAuthenticated } from "src/app/store/getters";
import { AuthService } from "src/app/services";

/**
 * /users/sign-in
 * @class SignInComponent
 */
@Component({
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"]
})
export class SignInComponent implements OnDestroy, OnInit {
  /**
   * Route paths configuration
   */
  public routes = appRoutes;

  /**
   * The error if authentication fails.
   * @type {Observable<string>}
   */
  public error: Observable<string>;

  /**
   * The authentication form.
   * @type {FormGroup}
   */
  public signinForm: FormGroup;

  /**
   * Component subscription
   * @type {Subscription}
   */
  private subscription: Subscription;

  /**
   * @constructor Constructor function
   * @param {FormBuilder} formBuilder Angular forms builder
   * @param {Store<AppState>} store Ngrx store service
   * @param {Router} router Angular Router service
   */
  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * @method ngOnInit Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  public ngOnInit() {
    // set formGroup
    this.signinForm = this.formBuilder.group({
      email: ["", Validators.required],
      password: ["", Validators.required]
    });

    this.error = this.store.select<string>(getAuthenticationError);

    // subscribe to success
    this.subscription = this.store
      .select<boolean>(isAuthenticated)
      .pipe(filter(authenticated => authenticated))
      .subscribe(value => {
        if (this.authService.redirectUrl) {
          this.router.navigate([this.authService.redirectUrl]);
        } else {
          this.router.navigate([appRoutes.PROFILE]);
        }
      });
  }

  /**
   * @method ngOnDestroy Lifecycle hook that is called when a directive, pipe or service is destroyed.
   */
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * @method submit Submit the authentication form.
   */
  public submit() {
    // get email and password values
    const email: string = this.signinForm.get("email").value.trim();
    const password: string = this.signinForm.get("password").value.trim();

    // dispatch AuthenticationAction and pass in payload
    this.store.dispatch(
      new AuthenticateAction({
        email,
        password
      })
    );
  }
}
