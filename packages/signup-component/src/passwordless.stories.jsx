/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PasswordlessSignupForm from './passwordless';

export default { title: 'PasswordlessSignupForm' };

export const Default = () => (
	<PasswordlessSignupForm
		onSubmit={ () => {} }
		recordTracksEvent={ () => {} }
		renderTerms={ () => {} }
	/>
);
