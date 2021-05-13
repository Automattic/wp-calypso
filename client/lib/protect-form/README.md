# Protect-Form

This component protects a user from navigating away from a form that has been edited without having been saved. When your form has been marked as changed, the browser will open a confirm dialog if you try to navigate away from the page without saving the changes.

The module exports two implementations. One is a
[Higher Order Component](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750)
that is used to wrap you form component.

The other is a declarative component that is supposed to be rendered inside the form. It
has an API that is more suitable for integration with Redux state.

## Usage (HOC)

```js
import { protectForm } from 'calypso/lib/protect-form';
```

... and then later in your component definition like so:

```js
export default protectForm( MyComponent );
```

The `protectForm` HoC provides a `markChanged` prop you can call on the `onChange` event of your form like this:

```jsx
<form onChange={ this.props.markChanged } onSubmit={ this.handleSubmit } />;
```

And then very important, you also need to to call the second prop `markSaved` when your form has been successfully submitted. Here is an example onSubmit callback handler.

```js
handleSubmit = ( event ) => {
	event.preventDefault();
	this.saveSettings( this.state ).then( () => {
		this.props.markSaved();
	} );
};
```

## Usage (declarative)

```js
import { ProtectFormGuard } from 'calypso/lib/protect-form';
```

... and then render the `ProtectFormGuard` inside your form to protect it, while changing
component state instead of calling functions:

```jsx
<form onChange={ this.handleChange } onSubmit={ this.handleSubmit }>
	<ProtectFormGuard isChanged={ this.state.isChanged } />
	...
</form>;
```

Here are example `onChange` and `onSubmit` handlers that change the state:

```js
handleChange = () => {
	this.setState( { isChanged: true } );
};

handleSubmit = ( event ) => {
	event.preventDefault();
	this.saveSettings( this.state ).then( () => this.setState( { isChanged: false } ) );
};
```
