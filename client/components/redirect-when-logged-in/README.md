# RedirectWhenLoggedIn

This is a helper component to redirect once it has been detected that the user is logged in.

## How It Works

On mount, it consults the global state tree. If a user is detected, it kicks off the redirect.
If a user is not detected, it subscribes to the `storage` event and listens for changes to the `wpcom_user_id` key.

## Usage

```javascript
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';

class YourComponent extends React.Component {
	// ...
	render() {
		return (
			<div>
				<RedirectWhenLoggedIn
					delayAtMount={ 3500 }
					redirectTo="/"
					replaceCurrentLocation={ true }
					waitForEmailAddress={ this.props.emailAddress }
				/>
				Stuff you want logged-out users to see before they log in.
			</div>
		);
	}
}
```

## Props

### `redirectTo`

Required. The URL to send the browser when login is detected.

### `delayAtMount`

Milliseconds to wait before redirecting if the user is logged in when the component mounts. Useful if you don't want them to see a fast "flash" of the page before doing the redirect.

### `replaceCurrentLocation`

Should `window.location.replace` be called? If so, the browser will not include the path in the History (i.e. the back button won't take you back "here" after the redirect). Default is to call `window.location.assign`.

### `waitForEmailAddress`

If specified, the component won't do anything until it is detected that the user with the provided email address logs in. The default is to redirect when any user is detected.

### `waitForUserId`

If specified, the component won't do anything until it is detected that the user with the provided email address logs in. The default is to redirect when any user is detected.
