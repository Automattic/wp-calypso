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
		<LoginBlock jetpack />
	</React.Fragment>
);

LoginExample.displayName = 'Login';

export default LoginExample;
