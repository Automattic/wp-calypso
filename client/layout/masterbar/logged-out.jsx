/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Masterbar from './masterbar';
import { connect } from 'react-redux';
import { getLocaleSlug, localize } from 'i18n-calypso';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Item from './item';
import config from 'config';
import { login } from 'lib/paths';
import WordPressWordmark from 'components/wordpress-wordmark';
import WordPressLogo from 'components/wordpress-logo';
import { getCurrentQueryArguments, getCurrentRoute } from 'state/selectors';

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
		const { sectionName, translate, redirectUri } = this.props;

		if ( includes( [ 'login', 'jetpack-onboarding' ], sectionName ) ) {
			return null;
		}

		const params = { locale: getLocaleSlug() };

		if ( redirectUri ) {
			params.redirectTo = redirectUri;
		} else if ( typeof window !== 'undefined' ) {
			params.redirectTo = window.location.href;
		}

		const loginUrl = login( {
			...params,
			isJetpack: 'jetpack-connect' === sectionName,
			isNative: config.isEnabled( 'login/native-login-links' ),
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
		if ( '/log-in/jetpack' === currentRoute && get( currentQuery, 'redirect_to', false ) ) {
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
