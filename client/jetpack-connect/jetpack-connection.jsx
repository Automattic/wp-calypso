/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, includes, omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import page from 'page';
import versionCompare from 'lib/version-compare';
import { redirect } from './utils';
import { addQueryArgs, externalRedirect } from 'lib/route';
import { checkUrl, dismissUrl } from 'state/jetpack-connect/actions';
import { getConnectingSite, getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { clearPlan, retrieveMobileRedirect, retrievePlan } from './persistence-utils';
import { recordTracksEvent } from 'state/analytics/actions';

import { IS_DOT_COM_GET_SEARCH, MINIMUM_JETPACK_VERSION } from './constants';
import {
	ALREADY_CONNECTED,
	ALREADY_OWNED,
	IS_DOT_COM,
	NOT_ACTIVE_JETPACK,
	NOT_CONNECTED_JETPACK,
	NOT_EXISTS,
	NOT_JETPACK,
	NOT_WORDPRESS,
	OUTDATED_JETPACK,
	SITE_BLOCKED,
	WORDPRESS_DOT_COM,
} from './connection-notice-types';

const debug = debugModule( 'calypso:jetpack-connect:main' );

const jetpackConnection = ( WrappedComponent ) => {
	class JetpackConnection extends Component {
		state = {
			url: '',
			redirecting: false,
			waitingForSites: true,
		};

		renderFooter = () => {
			const { translate } = this.props;
			return (
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
						{ translate( 'Install Jetpack manually' ) }
					</LoggedOutFormLinkItem>
					<HelpButton />
				</LoggedOutFormLinks>
			);
		};

		dismissUrl = () => this.props.dismissUrl( this.state.url );

		goBack = () => page.back();

		// HACK: We wrap _processJpSite here so that this.state.url
		// is consistent/up-to-date for all downstream calls.
		// Calling _processJpSite in setState's callback guarantees
		// it will only be executed after the state has been changed.
		//
		// TODO: Come back and simplify state management for this component.
		processJpSite = ( url ) => {
			this.setState( { url }, () => this._processJpSite( url ) );
		};

		_processJpSite = ( url ) => {
			const { isMobileAppFlow, skipRemoteInstall, forceRemoteInstall } = this.props;

			const status = this.getStatus( url );

			if (
				status === NOT_CONNECTED_JETPACK &&
				this.isCurrentUrlFetched() &&
				! forceRemoteInstall &&
				! this.state.redirecting
			) {
				this.redirect( 'remote_auth', this.props.siteHomeUrl );
			}

			if ( status === ALREADY_OWNED && ! this.state.redirecting ) {
				if ( isMobileAppFlow ) {
					this.redirectToMobileApp( 'already-connected' );
				}
				this.redirect( 'plans_selection', url );
			}

			if ( status === ALREADY_CONNECTED && ! this.state.redirecting ) {
				const currentPlan = retrievePlan();
				clearPlan();
				if ( currentPlan ) {
					this.redirect( 'checkout', url, currentPlan );
				} else {
					this.redirect( 'plans_selection', url );
				}
			}

			if ( this.state.waitingForSites && ! this.props.isRequestingSites ) {
				// eslint-disable-next-line react/no-did-update-set-state
				this.setState( { waitingForSites: false } );
				this.checkUrl( url );
			}

			if (
				includes( [ NOT_JETPACK, NOT_ACTIVE_JETPACK ], status ) ||
				( status === NOT_CONNECTED_JETPACK && forceRemoteInstall )
			) {
				if (
					config.isEnabled( 'jetpack/connect/remote-install' ) &&
					! isMobileAppFlow &&
					! skipRemoteInstall
				) {
					this.redirect( 'remote_install' );
				} else {
					this.redirect( 'install_instructions', url );
				}
			}
		};

		recordTracks = ( url, type ) => {
			this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
				url: url,
				type: type,
			} );
		};

		redirect = ( type, url, product ) => {
			if ( ! this.state.redirecting ) {
				this.setState( { redirecting: true } );

				redirect( type, url, product );
			}
		};

		redirectToMobileApp = ( reason ) => {
			if ( ! this.state.redirecting ) {
				this.setState( { redirecting: true } );

				const url = addQueryArgs( { reason }, this.props.mobileAppRedirect );
				debug( `Redirecting to mobile app ${ url }` );
				externalRedirect( url );
			}
		};

		isCurrentUrlFetched() {
			return (
				this.props.jetpackConnectSite &&
				this.state.url === this.props.jetpackConnectSite.url &&
				this.props.jetpackConnectSite.isFetched
			);
		}

		isCurrentUrlFetching() {
			return (
				this.state.url !== '' &&
				this.props.jetpackConnectSite &&
				this.state.url === this.props.jetpackConnectSite.url &&
				this.props.jetpackConnectSite.isFetching
			);
		}

		checkUrl( url ) {
			return this.props.checkUrl( url, !! this.props.getJetpackSiteByUrl( url ) );
		}

		checkProperty( propName ) {
			return (
				this.state.url &&
				this.props.jetpackConnectSite &&
				this.props.jetpackConnectSite.data &&
				this.isCurrentUrlFetched() &&
				this.props.jetpackConnectSite.data[ propName ]
			);
		}

		isError( error ) {
			return (
				this.state.url &&
				this.isCurrentUrlFetched() &&
				get( this.props.jetpackConnectSite, [ 'error', 'error' ] ) === error
			);
		}

		renderNotices = () => {
			const status = this.getStatus( this.state.url );

			return ! this.isCurrentUrlFetching() &&
				this.isCurrentUrlFetched() &&
				! this.props.jetpackConnectSite.isDismissed &&
				status ? (
				<JetpackConnectNotices
					noticeType={ status }
					onDismissClick={ IS_DOT_COM === status ? this.goBack : this.dismissUrl }
					url={ this.state.url }
					onTerminalError={ this.props.isMobileAppFlow ? this.redirectToMobileApp : null }
				/>
			) : null;
		};

		getStatus = ( url ) => {
			if ( url === '' ) {
				return false;
			}

			if ( this.checkProperty( 'isWordPressDotCom' ) ) {
				const product_path = window.location.pathname;

				if (
					product_path.includes( 'jetpack_search' ) ||
					product_path.includes( 'wpcom_search' )
				) {
					return IS_DOT_COM_GET_SEARCH;
				}
				return IS_DOT_COM;
			}

			if ( this.isError( 'site_blacklisted' ) ) {
				return SITE_BLOCKED;
			}

			if ( this.props.jetpackConnectSite.installConfirmedByUser === false ) {
				return NOT_JETPACK;
			}

			if ( this.props.jetpackConnectSite.installConfirmedByUser === true ) {
				return NOT_ACTIVE_JETPACK;
			}

			if (
				url.toLowerCase() === 'http://wordpress.com' ||
				url.toLowerCase() === 'https://wordpress.com'
			) {
				return WORDPRESS_DOT_COM;
			}

			if ( ! this.checkProperty( 'exists' ) ) {
				return NOT_EXISTS;
			}
			if ( ! this.checkProperty( 'isWordPress' ) ) {
				return NOT_WORDPRESS;
			}
			if ( ! this.checkProperty( 'hasJetpack' ) ) {
				return NOT_JETPACK;
			}
			const jetpackVersion = this.checkProperty( 'jetpackVersion' );
			if ( jetpackVersion && versionCompare( jetpackVersion, MINIMUM_JETPACK_VERSION, '<' ) ) {
				return OUTDATED_JETPACK;
			}
			if ( ! this.checkProperty( 'isJetpackActive' ) ) {
				return NOT_ACTIVE_JETPACK;
			}
			if (
				! this.checkProperty( 'isJetpackConnected' ) ||
				( this.checkProperty( 'isJetpackConnected' ) && ! this.checkProperty( 'userOwnsSite' ) )
			) {
				return NOT_CONNECTED_JETPACK;
			}
			if ( this.checkProperty( 'isJetpackConnected' ) && this.checkProperty( 'userOwnsSite' ) ) {
				return ALREADY_CONNECTED;
			}

			if ( this.checkProperty( 'userOwnsSite' ) ) {
				return ALREADY_OWNED;
			}

			return false;
		};

		handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

		render() {
			const props = this.props.locale ? this.props : omit( this.props, 'locale' );
			const status = this.getStatus( this.state.url );

			return (
				<WrappedComponent
					processJpSite={ this.processJpSite }
					status={ status }
					renderFooter={ this.renderFooter }
					renderNotices={ this.renderNotices }
					isCurrentUrlFetching={ this.isCurrentUrlFetching() }
					{ ...props }
				/>
			);
		}
	}

	const connectComponent = connect(
		( state ) => {
			// Note: reading from a cookie here rather than redux state,
			// so any change in value will not execute connect().
			const mobileAppRedirect = retrieveMobileRedirect();
			const isMobileAppFlow = !! mobileAppRedirect;
			const jetpackConnectSite = getConnectingSite( state );
			const siteData = jetpackConnectSite.data || {};
			const skipRemoteInstall = siteData.skipRemoteInstall;

			return {
				// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
				getJetpackSiteByUrl: ( url ) => getJetpackSiteByUrl( state, url ),
				isMobileAppFlow,
				isRequestingSites: isRequestingSites( state ),
				jetpackConnectSite,
				mobileAppRedirect,
				skipRemoteInstall,
				siteHomeUrl: siteData.urlAfterRedirects || jetpackConnectSite.url,
			};
		},
		{
			checkUrl,
			dismissUrl,
			recordTracksEvent,
		}
	);

	return flowRight( connectComponent, localize )( JetpackConnection );
};

export default jetpackConnection;
