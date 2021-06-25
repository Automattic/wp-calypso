/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import FormRadio from 'calypso/components/forms/form-radio';

/**
 * Style dependencies
 */
import './style.scss';

function AuthHelper() {
	const isOAuth = config.isEnabled( 'oauth' );

	function setAuth( event ) {
		const value = event.currentTarget.value;
		window.location.href = '?' + new URLSearchParams( { flags: value } ).toString();
	}

	/* eslint-disable jsx-a11y/label-has-associated-control */
	return (
		<>
			<div>Auth: { isOAuth ? 'OAuth' : 'Cookies' }</div>
			<div className="auth-helper__popover">
				<label className="auth-helper__label">
					<FormRadio name="auth" value="-oauth" defaultChecked={ ! isOAuth } onChange={ setAuth } />
					Cookies
				</label>
				<label className="auth-helper__label">
					<FormRadio name="auth" value="oauth" defaultChecked={ isOAuth } onChange={ setAuth } />
					OAuth
				</label>
			</div>
		</>
	);
	/* eslint-enable jsx-a11y/label-has-associated-control */
}

export default ( element ) => ReactDom.render( <AuthHelper />, element );
