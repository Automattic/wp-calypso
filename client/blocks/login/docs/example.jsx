/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import LoginBlock from 'blocks/login';

const LoginExample = () => (
	<React.Fragment>
		<LoginBlock />
		<p />
		<LoginBlock isJetpack />
	</React.Fragment>
);

LoginExample.displayName = 'Login';

export default LoginExample;
