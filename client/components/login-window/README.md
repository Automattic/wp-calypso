# LoginWindow

This component is used to display a WordPress.com login or create account form in a popup window.
When the user has successfully logged in or created an account, the window will send a postMessage confirming login has completed, then the window will close. 
The component will listen for the postMessage from the window and call the onLoginSuccess callback.

## How to use

```js
import { Button } from '@wordpress/components';
import useLoginWindow from 'calypso/components/login-window';
import WordPressLogo from 'calypso/components/wordpress-logo';

const MyLoginForm = () => {
	const { login, createAccount } = useLoginWindow( {
		onLoginSuccess: () => window.location.reload(),
	} );

	return (
		<div className="reader-join-conversation-dialog__content">
			<WordPressLogo size={ 32 } />
			<h1>You need to be logged in!</h1>
			<Button	isPrimary onClick={ createAccount } >Create a new account</Button>
			<br />
			<Button isLink onClick={ login }>Log in</Button>
		</div>
	);
};
```

## Props

