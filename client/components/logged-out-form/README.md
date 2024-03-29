# LoggedOutForm

This component is meant to be used when creating form for logged out users. You can find this component in use within the signup framework at `client/signup` and within the invite acceptance section within `client/my-sites/invite-accept`.

## Usage

```js
import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import LoggedOutFormFooter from 'calypso/components/logged-out-form-footer';

class MyLoggedOutForm extends React.Component {
	handleSubmit = ( event ) => {
		event.preventDefault();

		// Handle form submit
	};

	render() {
		return (
			<>
				<LoggedOutForm onSubmit={ this.handleSubmit }>
					<FormTextInput placeholder="I am an input" />

					<LoggedOutFormFooter>
						<Button primary>Submit</Button>
					</LoggedOutFormFooter>
				</LoggedOutForm>

				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href={ config( 'login_url' ) }>
						Sign in as a different user
					</LoggedOutFormLinkItem>
				</LoggedOutFormLinks>
			</>
		);
	}
}
```
