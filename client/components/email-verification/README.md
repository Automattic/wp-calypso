Email Verification
==================

`EmailVerificationNotice` displays a notice to when the current user has not verified their account, prompting them to click the link in the verification email and allowing them to resend the email.


# Usage
```js
import EmailVerificationNotice from 'components/email-verification';
import userFactory from 'lib/user';
const user = userFactory();

render() {
	return (
		<EmailVerificationNotice user={ user } />
	);
}
```

#### Props
* `user`: An object containing the user info.
