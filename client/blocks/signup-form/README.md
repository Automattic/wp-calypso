# Signup Form

This block renders a Signup Form. It magically handles email, username, and password validation.

## Usage

A Signup Form instance expects `save` and `submitForm` properties, `save` is called `onBlur` of each field. `submitForm` is called when the form is submitted.
Optional:
redirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl }
disabled={ this.isDisabled() }
submitting={ this.isSubmitting() }

```js
import SignupForm from 'calypso/blocks/signup-form';

function render() {
	return (
		<SignupForm
			{ ...this.props }
			redirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl }
			disabled={ this.isDisabled() }
			submitting={ this.isSubmitting() }
			save={ this.save }
			submitForm={ this.submitForm }
		/>
	);
}
```

## Props

- `submitForm` function - Called when the form is submitted. It will receive the following parameters: `form`, `userData` and `analyticsData`
- `submitButtonText` string: The text displayed inside the submit button
- `getRedirectToAfterLoginUrl` string: Where the user should be redirected after being logged in
- `suggestedUsername` string: A suggested username based on the domain name the user chose during signup
- (optional) `save` function: Called `onBlur` of each field with `form` as parameter
- (optional) `disabled` boolean: Sets the form as disabled
- (optional) `submitting` boolean: Sets the state of the form as being submitted
- (optional) `email` string: Initial value for email input
- (optional) `disableEmailInput` boolean: Disables the email input. Useful if email must be a certain value and that value is passed in through the `email` prop
- (optional) `disableEmailExplanation` string: Explanation text that appears beneath the email field when disabled.
