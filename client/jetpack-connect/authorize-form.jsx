/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import {
	createAccount,
	authorize,
	goBackToWpAdmin,
	retryAuth,
	goToXmlrpcErrorFallbackUrl
} from 'state/jetpack-connect/actions';
import {
	getAuthorizationData,
	getAuthorizationRemoteSite,
	isCalypsoStartedConnection,
	hasXmlrpcError,
	hasExpiredSecretError,
	isRemoteSiteOnSitesList,
	getAuthAttempts,
	getSiteIdFromQueryObject,
	getUserAlreadyConnected
} from 'state/jetpack-connect/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import { requestSites } from 'state/sites/actions';
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';
import MainWrapper from './main-wrapper';
import HelpButton from './help-button';
import { urlToSlug } from 'lib/url';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authAttempts: PropTypes.number,
		authorize: PropTypes.func,
		calypsoStartedConnection: PropTypes.bool,
		createAccount: PropTypes.func,
		goBackToWpAdmin: PropTypes.func,
		goToXmlrpcErrorFallbackUrl: PropTypes.func,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		jetpackConnectAuthorize: PropTypes.shape( {
			queryObject: PropTypes.shape( {
				client_id: PropTypes.string,
				from: PropTypes.string,
			} ).isRequired,
		} ).isRequired,
		recordTracksEvent: PropTypes.func,
		setTracksAnonymousUserId: PropTypes.func,
		requestHasExpiredSecretError: PropTypes.func,
		requestHasXmlrpcError: PropTypes.func,
		requestSites: PropTypes.func,
		retryAuth: PropTypes.func,
		siteSlug: PropTypes.string,
		user: PropTypes.object,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const queryObject = this.props.jetpackConnectAuthorize.queryObject;
		if ( queryObject._ui && 'anon' === queryObject._ut ) {
			this.props.setTracksAnonymousUserId( queryObject._ui );
		}
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	}

	isSSO() {
		const cookies = cookie.parse( document.cookie );
		const query = this.props.jetpackConnectAuthorize.queryObject;
		return (
			query.from &&
			'sso' === query.from &&
			cookies.jetpack_sso_approved &&
			query.client_id &&
			query.client_id === cookies.jetpack_sso_approved
		);
	}

	isWCS() {
		return 'woocommerce-services' === this.props.jetpackConnectAuthorize.queryObject.from;
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	}

	renderNoQueryArgsError() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/illustrations/whoops.svg"
					title={ this.props.translate(
						'Oops, this URL should not be accessed directly'
					) }
					action={ this.props.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<HelpButton onClick={ this.handleClickHelp } />
				</LoggedOutFormLinks>
			</Main>
		);
	}

	renderForm() {
		return (
			( this.props.user )
				? <LoggedInForm
					{ ...this.props }
					isSSO={ this.isSSO() }
					isWCS={ this.isWCS() }
				/>
				: <LoggedOutForm
					{ ...this.props }
					isSSO={ this.isSSO() }
					isWCS={ this.isWCS() }
				/>
		);
	}

	render() {
		const { queryObject } = this.props.jetpackConnectAuthorize;

		if ( typeof queryObject === 'undefined' ) {
			return this.renderNoQueryArgsError();
		}

		if ( queryObject && queryObject.already_authorized && ! this.props.isAlreadyOnSitesList ) {
			this.renderForm();
		}

		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">
					{ this.renderForm() }
				</div>
			</MainWrapper>
		);
	}
}

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteSlug = urlToSlug( remoteSiteUrl );
		const requestHasExpiredSecretError = () => hasExpiredSecretError( state );
		const requestHasXmlrpcError = () => hasXmlrpcError( state );
		const siteId = getSiteIdFromQueryObject( state );

		return {
			authAttempts: getAuthAttempts( state, siteSlug ),
			calypsoStartedConnection: isCalypsoStartedConnection( state, remoteSiteUrl ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
			isFetchingAuthorizationSite: isRequestingSite( state, siteId ),
			isFetchingSites: isRequestingSites( state ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			requestHasExpiredSecretError,
			requestHasXmlrpcError,
			siteSlug,
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state )
		};
	},
	{
		authorize,
		createAccount,
		goBackToWpAdmin,
		goToXmlrpcErrorFallbackUrl,
		recordTracksEvent,
		setTracksAnonymousUserId,
		requestSites,
		retryAuth,
	}
)( localize( JetpackConnectAuthorizeForm ) );
