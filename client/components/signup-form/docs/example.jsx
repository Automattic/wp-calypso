/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import SignupForm from '../index';

function SignupFormExample() {
	return (
		<SignupForm
			suggestedUsername=""
			save={ noop }
			submitForm={ noop }
			redirectToAfterLoginUrl={ window.location.href }
			submitButtonText="Sign Up"
		/>
	);
}

SignupFormExample.displayName = 'SignupForm';

export default SignupFormExample;
