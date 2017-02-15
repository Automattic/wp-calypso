/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Login from 'blocks/login';

export default React.createClass( {

	displayName: 'Login',

	render() {
		return (
			<Login
				title={ 'Sign in to connect to WordPress.com' }
				legalText={ 'Custom footer text can be added here.' } />
		);
	}
} );
