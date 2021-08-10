import React from 'react';
import LoginBlock from 'calypso/blocks/login';

const LoginExample = () => (
	<React.Fragment>
		<LoginBlock disableAutoFocus />
		<p />
		<LoginBlock disableAutoFocus isJetpack />
	</React.Fragment>
);

LoginExample.displayName = 'Login';

export default LoginExample;
