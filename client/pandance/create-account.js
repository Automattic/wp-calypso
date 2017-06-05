/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */

import Button from 'components/button';

const redirect = () => {
	page( '/pandance/content-preview?type=final' );
};

const translate = text => text;

export default props => {
	return <div className="account-step wrapper">
		<h2>Ok great, we are preparing your site!</h2>
		<p>Now lets create your account so we can wrap this up.</p>

		<div className="card">
			<fieldset className="validation-fieldset form-fieldset">
				<label for="email" className="form-label">Your email address</label>
				<input type="email" autocapitalize="off" autocorrect="off" className="form-text-input signup-form__input" id="email" name="email" value="" />
			</fieldset>
			<fieldset className="validation-fieldset form-fieldset">
				<label for="username" className="form-label">Choose a username</label>
				<input type="text" autocapitalize="off" autocorrect="off" className="form-text-input signup-form__input" id="username" name="username" />
			</fieldset>
			<fieldset className="validation-fieldset form-fieldset">
				<label for="password" className="form-label">Choose a password</label>
				<div className="form-password-input">
					<input type="password" className="form-text-input signup-form__input" id="password" name="password" autocomplete="off" />
				</div>
			</fieldset>
			<Button
				primary={ true }
				onClick={ redirect }
			>View My Site</Button>
		</div>



	</div>;
};
