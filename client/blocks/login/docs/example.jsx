import { Fragment } from 'react';
import LoginBlock from 'calypso/blocks/login';

const LoginExample = () => (
	<Fragment>
		<LoginBlock disableAutoFocus />
		<p />
		<LoginBlock disableAutoFocus isJetpack />
	</Fragment>
);

LoginExample.displayName = 'Login';

export default LoginExample;
