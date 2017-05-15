/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
	getSSOSessions,
	isCalypsoStartedConnection,
	hasXmlrpcError,
	hasExpiredSecretError,
	getSiteSelectedPlan,
	isRemoteSiteOnSitesList,
	getGlobalSelectedPlan,
	getAuthAttempts,
	getSiteIdFromQueryObject
} from 'state/jetpack-connect/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import { requestSites } from 'state/sites/actions';
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';
import MainWrapper from './main-wrapper';
import HelpButton from './help-button';
import { urlToSlug } from 'lib/url';
import Plans from './plans';
import CheckoutData from 'components/data/checkout';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authAttempts: PropTypes.number,
		calypsoStartedConnection: PropTypes.bool,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		jetpackConnectAuthorize: PropTypes.shape( {
			queryObject: PropTypes.shape( {
				client_id: PropTypes.string,
				from: PropTypes.string,
			} ).isRequired,
		} ).isRequired,
		plansFirst: PropTypes.bool,
		requestHasExpiredSecretError: PropTypes.func,
		requestHasXmlrpcError: PropTypes.func,
		selectedPlan: PropTypes.string,
		siteSlug: PropTypes.string,
		user: PropTypes.object,

		// FIXME: Is this prop used? Can it be removed completely?
		jetpackSSOSessions: PropTypes.any,
	}

	componentWillMount() {
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

	renderNoQueryArgsError() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.props.translate(
						'Oops, this URL should not be accessed directly'
					) }
					action={ this.props.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<HelpButton onClick={ this.clickHelpButton } />
				</LoggedOutFormLinks>
			</Main>
		);
	}

	renderPlansSelector() {
		return (
			<div>
				<CheckoutData>
					<Plans { ...this.props } showFirst={ true } />
				</CheckoutData>
			</div>
		);
	}

	renderForm() {
		return (
			( this.props.user )
				? <LoggedInForm { ...this.props } isSSO={ this.isSSO() } />
				: <LoggedOutForm { ...this.props } isSSO={ this.isSSO() } />
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

		if ( this.props.plansFirst && ! this.props.selectedPlan ) {
			return this.renderPlansSelector();
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
		const selectedPlan = getSiteSelectedPlan( state, siteSlug ) || getGlobalSelectedPlan( state );
		const siteId = getSiteIdFromQueryObject( state );

		return {
			authAttempts: getAuthAttempts( state, siteSlug ),
			calypsoStartedConnection: isCalypsoStartedConnection( state, remoteSiteUrl ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
			isFetchingAuthorizationSite: isRequestingSite( state, siteId ),
			isFetchingSites: isRequestingSites( state ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			plansFirst: false,
			requestHasExpiredSecretError,
			requestHasXmlrpcError,
			selectedPlan,
			siteSlug,
			user: getCurrentUser( state ),

			// FIXME: Is this prop used? Can it be removed completely?
			jetpackSSOSessions: getSSOSessions( state ),
		};
	},
	{
		authorize,
		createAccount,
		goBackToWpAdmin,
		goToXmlrpcErrorFallbackUrl,
		recordTracksEvent,
		requestSites,
		retryAuth,
	}
)( localize( JetpackConnectAuthorizeForm ) );
