/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Masterbar from './masterbar';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Item from './item';
import config from 'config';
import { login } from 'lib/paths';
import WordPressWordmark from 'components/wordpress-wordmark';
import WordPressLogo from 'components/wordpress-logo';

function getLoginUrl( redirectUri ) {
	const params = {};
	if ( redirectUri ) {
		params.redirectTo = redirectUri;
	} else if ( typeof window !== 'undefined' ) {
		params.redirectTo = window.location.href;
	}

	return login( { ...params, isNative: config.isEnabled( 'login/native-login-links' ) } );
}

const MasterbarLoggedOut = ( { title, sectionName, translate, redirectUri } ) => (
	<Masterbar>
		<Item className="masterbar__item-logo">
			<WordPressLogo className="masterbar__wpcom-logo" />
			<WordPressWordmark className="masterbar__wpcom-wordmark" />
		</Item>
		<Item className="masterbar__item-title">{ title }</Item>
		<div className="masterbar__login-links">
			{ 'signup' !== sectionName ? (
				<Item url={ config( 'signup_url' ) }>
					{ translate( 'Sign Up', {
						context: 'Toolbar',
						comment: 'Should be shorter than ~12 chars',
					} ) }
				</Item>
			) : null }

			{ 'login' !== sectionName ? (
				<Item url={ getLoginUrl( redirectUri ) }>
					{ translate( 'Log In', {
						context: 'Toolbar',
						comment: 'Should be shorter than ~12 chars',
					} ) }
				</Item>
			) : null }
		</div>
	</Masterbar>
);

MasterbarLoggedOut.propTypes = {
	title: PropTypes.string,
	sectionName: PropTypes.string,
	redirectUri: PropTypes.string,
};

MasterbarLoggedOut.defaultProps = {
	title: '',
	sectionName: '',
};

export default localize( MasterbarLoggedOut );
