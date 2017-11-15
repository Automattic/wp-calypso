/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import cookie from 'cookie';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import {
	getAuthorizationData,
	getAuthorizationRemoteSite,
	isCalypsoStartedConnection,
	isRemoteSiteOnSitesList,
	getAuthAttempts,
	getSiteIdFromQueryObject,
	getUserAlreadyConnected,
} from 'state/jetpack-connect/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import { isRequestingSites, isRequestingSite } from 'state/sites/selectors';
import MainWrapper from './main-wrapper';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import { urlToSlug } from 'lib/url';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authAttempts: PropTypes.number,
		calypsoStartedConnection: PropTypes.bool,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		jetpackConnectAuthorize: PropTypes.shape( {
			queryObject: PropTypes.shape( {
				client_id: PropTypes.string,
				from: PropTypes.string,
			} ),
		} ).isRequired,
		recordTracksEvent: PropTypes.func,
		setTracksAnonymousUserId: PropTypes.func,
		siteSlug: PropTypes.string,
		user: PropTypes.object,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const queryObject = this.props.jetpackConnectAuthorize.queryObject;
		if ( queryObject && queryObject._ui && 'anon' === queryObject._ut ) {
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

	isWoo() {
		const wooSlugs = [ 'woocommerce-setup-wizard', 'woocommerce-services' ];
		const jetpackConnectSource = get( this.props, 'jetpackConnectAuthorize.queryObject.from' );

		return includes( wooSlugs, jetpackConnectSource );
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	renderNoQueryArgsError() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/illustrations/whoops.svg"
					title={ this.props.translate( 'Oops, this URL should not be accessed directly' ) }
					action={ this.props.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<JetpackConnectHappychatButton eventName="calypso_jpc_noqueryarguments_chat_initiated">
						<HelpButton onClick={ this.handleClickHelp } />
					</JetpackConnectHappychatButton>
				</LoggedOutFormLinks>
			</Main>
		);
	}

	renderForm() {
		return this.props.user ? (
			<LoggedInForm { ...this.props } isSSO={ this.isSSO() } isWoo={ this.isWoo() } />
		) : (
			<LoggedOutForm
				jetpackConnectAuthorize={ this.props.jetpackConnectAuthorize }
				local={ this.props.locale }
				path={ this.props.path }
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
				<div className="jetpack-connect__authorize-form">{ this.renderForm() }</div>
			</MainWrapper>
		);
	}
}

export { JetpackConnectAuthorizeForm as JetpackConnectAuthorizeFormTestComponent };

export default connect(
	state => {
		const remoteSiteUrl = getAuthorizationRemoteSite( state );
		const siteSlug = urlToSlug( remoteSiteUrl );
		const siteId = getSiteIdFromQueryObject( state );

		return {
			authAttempts: getAuthAttempts( state, siteSlug ),
			calypsoStartedConnection: isCalypsoStartedConnection( state, remoteSiteUrl ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
			isFetchingAuthorizationSite: isRequestingSite( state, siteId ),
			isFetchingSites: isRequestingSites( state ),
			jetpackConnectAuthorize: getAuthorizationData( state ),
			siteSlug,
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state ),
		};
	},
	{
		recordTracksEvent,
		setTracksAnonymousUserId,
	}
)( localize( JetpackConnectAuthorizeForm ) );
