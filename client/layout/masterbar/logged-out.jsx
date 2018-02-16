/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Masterbar from './masterbar';
import { connect } from 'react-redux';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { get, includes, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Item from './item';
import WordPressLogo from 'components/wordpress-logo';
import WordPressWordmark from 'components/wordpress-wordmark';
import { addQueryArgs } from 'lib/route';
import { getCurrentQueryArguments, getCurrentRoute } from 'state/selectors';
import { login } from 'lib/paths';

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

	renderLoginItem() {
		const { currentQuery, currentRoute, sectionName, translate, redirectUri } = this.props;

		if ( includes( [ 'login', 'jetpack-onboarding' ], sectionName ) ) {
			return null;
		}

		const isJetpack = 'jetpack-connect' === sectionName;

		const loginUrl = login( {
			// We may know the email from Jetpack connection details
			emailAddress: isJetpack && get( currentQuery, 'user_email', false ),
			isJetpack,
			isNative: config.isEnabled( 'login/native-login-links' ),
			locale: getLocaleSlug(),
			redirectTo: redirectUri || addQueryArgs( currentQuery, currentRoute ),
		} );

		return (
			<Item url={ loginUrl }>
				{ translate( 'Log In', {
					context: 'Toolbar',
					comment: 'Should be shorter than ~12 chars',
				} ) }
			</Item>
		);
	}

	renderSignupItem() {
		const { currentQuery, currentRoute, sectionName, translate } = this.props;

		if ( includes( [ 'signup', 'jetpack-onboarding', 'jetpack-connect' ], sectionName ) ) {
			return null;
		}

		let signupUrl = config( 'signup_url' );
		if (
			// Match locales like `/log-in/jetpack/es`
			startsWith( currentRoute, '/log-in/jetpack' ) &&
			// Ensure our redirection is to Jetpack Connect
			includes( get( currentQuery, 'redirect_to' ), '/jetpack/connect/authorize' )
		) {
			signupUrl = currentQuery.redirect_to;
		}

		return (
			<Item url={ signupUrl }>
				{ translate( 'Sign Up', {
					context: 'Toolbar',
					comment: 'Should be shorter than ~12 chars',
				} ) }
			</Item>
		);
	}

	render() {
		const { title } = this.props;
		return (
			<Masterbar>
				<Item className="masterbar__item-logo">
					<WordPressLogo className="masterbar__wpcom-logo" />
					<WordPressWordmark className="masterbar__wpcom-wordmark" />
				</Item>
				<Item className="masterbar__item-title">{ title }</Item>
				<div className="masterbar__login-links">
					{ this.renderSignupItem() }
					{ this.renderLoginItem() }
				</div>
			</Masterbar>
		);
	}
}

export default connect( state => ( {
	currentQuery: getCurrentQueryArguments( state ),
	currentRoute: getCurrentRoute( state ),
} ) )( localize( MasterbarLoggedOut ) );
