# Signup

This directory contains modules related to the signup flow.

## How to Use

Check the signup documentation at `/client/signup/README.md` for information about adding a new flow or step to the signup flow.

## Modules

### `SignupProgressStore`

`SignupProgressStore` stores the user's progress through a signup flow by storing a list of the steps in the signup flow the user has submitted. This list is initially empty and steps are added to it as the user progresses through the flow.

A step begins as an object which is collected by the store through the `SUBMIT_SIGNUP_STEP` action. Once steps are added to the `SignupProgressStore`, they receive a `status` string property which is set to either `in-progress`, `processing`, `pending`, `completed`, or `invalid`.

The array of steps in the store is returned by the `SignupProgressStore#get()`.

### `SignupActions`

Each action takes a `step` object with the following properties:

- `stepName` (required)
- `apiRequestFunction` (optional) — Used to submit the step to the API. Its presence determines of the `status` of the step is `pending` or `completed`.

```js
const object = {
	stepName: 'user-social', // required
	apiRequestFunction: function ( callback ) {
		// optional
		wpcom.req.post( '/some-endpoint', function ( errors, response ) {
			callback( errors, { userId: response.userId } );
		} );
	},
};
```

#### Actions

- `submitSignupStep( step, providedDependencies )` — the user submits a step
- `completeSignupStep( step, errors, providedDependencies )` — a step processed by the API

If `errors` has a non-zero length, it will be attached to the step and the step's status will be set to `invalid` as it is added to the store. If a `providedDependencies` object is included, its information will be added to the dependency store.

### SignupDependencyStore

Actions which provide a `providedDependencies` object will have this information added to the dependency store.

```js
import SignupActions from 'calypso/lib/signup/actions';
import SignupDependencyStore from 'calypso/lib/signup/dependency-store';

SignupActions.completeSignupStep( { stepName: 'example' }, [], { userId: 1337 } );

SignupDependencyStore.get(); // => { userId: 1337 }
```

### `SignupFlowController`

`SignupFlowController` initializes a new signup flow and handles initiating API requests for the steps that have an `apiRequestFunction` property. It provides a view with a method for getting the current step and a callback for when the flow is completed.

#### Example

`SignupFlowController` accepts an object with a `flowName` property and begins the signup flow with the given name.

```js
import SignupFlowController from 'calypso/lib/signup/flow-controller';

// this is the component that renders the signup flow
class SignupComponent extends React.Component {
	constructor() {
		super();
		this.signupFlowController = new SignupFlowController( {
			flowName: 'default', // the name of the flow to begin, from flows.json
			onComplete: function () {
				// optional callback, called when the flow is completed
				console.log( 'The user completed the flow. Redirect or log them in here.' );
			},
		} );
	}

	render() {
		const CurrentStepComponent = this.signupFlowController.currentStep().component; // the component from steps.js

		return <CurrentStepComponent />;
	}
}
```
