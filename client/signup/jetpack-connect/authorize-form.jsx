/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
	getAuthAttempts
} from 'state/jetpack-connect/selectors';
import observe from 'lib/mixins/data-observe';
import { recordTracksEvent } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import { requestSites } from 'state/sites/actions';
import { isRequestingSites } from 'state/sites/selectors';
import MainWrapper from './main-wrapper';
import HelpButton from './help-button';
import { urlToSlug } from 'lib/url';
import Plans from './plans';
import CheckoutData from 'components/data/checkout';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

const JetpackConnectAuthorizeForm = React.createClass( {
	displayName: 'JetpackConnectAuthorizeForm',
	mixins: [ observe( 'userModule' ) ],

	componentWillMount() {
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	},

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
	},

	renderNoQueryArgsError() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate(
						'Oops, this URL should not be accessed directly'
					) }
					action={ this.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<HelpButton onClick={ this.clickHelpButton } />
				</LoggedOutFormLinks>
			</Main>
		);
	},

	renderPlansSelector() {
		return (
				<div>
					<CheckoutData>
						<Plans { ...this.props } showFirst={ true } />
					</CheckoutData>
				</div>
		);
	},

	renderForm() {
		const { userModule } = this.props;
		const user = userModule.get();
		const props = Object.assign( {}, this.props, {
			user: user
		} );

		return (
			( user )
				? <LoggedInForm { ...props } isSSO={ this.isSSO() } />
				: <LoggedOutForm { ...props } isSSO={ this.isSSO() } />
		);
	},

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
} );

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteSlug = urlToSlug( remoteSiteUrl );
		const requestHasXmlrpcError = () => {
			return hasXmlrpcError( state );
		};
		const requestHasExpiredSecretError = () => {
			return hasExpiredSecretError( state );
		};
		const selectedPlan = getSiteSelectedPlan( state, siteSlug ) || getGlobalSelectedPlan( state );

		return {
			siteSlug,
			selectedPlan,
			jetpackConnectAuthorize: getAuthorizationData( state ),
			plansFirst: false,
			jetpackSSOSessions: getSSOSessions( state ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
			isFetchingSites: isRequestingSites( state ),
			requestHasXmlrpcError,
			requestHasExpiredSecretError,
			calypsoStartedConnection: isCalypsoStartedConnection( state, remoteSiteUrl ),
			authAttempts: getAuthAttempts( state, siteSlug ),
		};
	},
	dispatch => bindActionCreators( {
		requestSites,
		recordTracksEvent,
		authorize,
		createAccount,
		goBackToWpAdmin,
		retryAuth,
		goToXmlrpcErrorFallbackUrl
	}, dispatch )
)( JetpackConnectAuthorizeForm );
