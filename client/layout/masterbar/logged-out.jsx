/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Masterbar from './masterbar';
import { connect } from 'react-redux';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import Item from './item';
import config from 'config';
import { login } from 'lib/paths';
import WordPressWordmark from 'components/wordpress-wordmark';
import WordPressLogo from 'components/wordpress-logo';
import { getCurrentQueryArguments, getCurrentRoute } from 'state/selectors';

function getLoginUrl( redirectUri ) {
	const params = { locale: getLocaleSlug() };

	if ( redirectUri ) {
		params.redirectTo = redirectUri;
	} else if ( typeof window !== 'undefined' ) {
		params.redirectTo = window.location.href;
	}

	return login( { ...params, isNative: config.isEnabled( 'login/native-login-links' ) } );
}

function getSignupUrl( currentRoute, currentQuery ) {
	if ( '/log-in/jetpack' === currentRoute && currentQuery.redirect_to ) {
		return currentQuery.redirect_to;
	}
	return config( 'signup_url' );
}

class MasterbarLoggedOut extends PureComponent {
	static propTypes = {
		redirectUri: PropTypes.string,
		sectionName: PropTypes.string,
		title: PropTypes.string,

		// Connected props
		currentQuery: PropTypes.object,
		currentRoute: PropTypes.string,
	};

	static defaultProps = {
		sectionName: '',
		title: '',
	};

	render() {
		const { currentQuery, currentRoute, title, sectionName, translate, redirectUri } = this.props;
		return (
			<Masterbar>
				<Item className="masterbar__item-logo">
					<WordPressLogo className="masterbar__wpcom-logo" />
					<WordPressWordmark className="masterbar__wpcom-wordmark" />
				</Item>
				<Item className="masterbar__item-title">{ title }</Item>
				<div className="masterbar__login-links">
					{ ! includes( [ 'signup', 'jetpack-onboarding' ], sectionName ) ? (
						<Item url={ getSignupUrl( currentRoute, currentQuery ) }>
							{ translate( 'Sign Up', {
								context: 'Toolbar',
								comment: 'Should be shorter than ~12 chars',
							} ) }
						</Item>
					) : null }

					{ ! includes( [ 'login', 'jetpack-onboarding' ], sectionName ) ? (
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
	}
}

export default connect( state => ( {
	currentQuery: getCurrentQueryArguments( state ),
	currentRoute: getCurrentRoute( state ),
} ) )( localize( MasterbarLoggedOut ) );
