/**
 * External dependencies
 */
import debugModule from 'debug';
import config from 'config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, includes, startsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import HelpButton from './help-button';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import page from 'page';
import versionCompare from 'lib/version-compare';
import { addCalypsoEnvQueryArg } from './utils';
import { addQueryArgs, externalRedirect } from 'lib/route';
import { checkUrl } from 'state/jetpack-connect/actions';
import { FLOW_TYPES } from 'state/jetpack-connect/constants';
import { getConnectingSite, getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { retrieveMobileRedirect } from './persistence-utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { urlToSlug } from 'lib/url';

import {
	JPC_PATH_PLANS,
	JPC_PATH_REMOTE_INSTALL,
	MINIMUM_JETPACK_VERSION,
	REMOTE_PATH_AUTH,
} from './constants';
import {
	ALREADY_CONNECTED,
	ALREADY_OWNED,
	IS_DOT_COM,
	IS_DOT_COM_GET_SEARCH,
	NOT_ACTIVE_JETPACK,
	NOT_CONNECTED_JETPACK,
	NOT_EXISTS,
	NOT_JETPACK,
	NOT_WORDPRESS,
	OUTDATED_JETPACK,
	SITE_BLACKLISTED,
	WORDPRESS_DOT_COM,
} from './connection-notice-types';

const debug = debugModule( 'calypso:jetpack-connect:main' );

const jetpackConnection = ( WrappedComponent ) => {
	class JetpackConnection extends Component {
		state = {
			status: '',
			url: '',
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

		processJpSite = ( url ) => {
			const { isMobileAppFlow, skipRemoteInstall, forceRemoteInstall } = this.props;

			const status = this.getStatus( url );

			this.setState( { url, status } );

			if (
				status === NOT_CONNECTED_JETPACK &&
				this.isCurrentUrlFetched() &&
				! forceRemoteInstall &&
				! this.state.redirecting
			) {
				this.goToRemoteAuth( this.props.siteHomeUrl );
			}
			if ( status === ALREADY_OWNED && ! this.state.redirecting ) {
				if ( isMobileAppFlow ) {
					this.redirectToMobileApp( 'already-connected' );
				}
				this.goToPlans( url );
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
					this.goToRemoteInstall( JPC_PATH_REMOTE_INSTALL );
				} else {
					this.goToInstallInstructions( '/jetpack/connect/instructions' );
				}
			}
		};

		recordTracks = ( url, type ) => {
			this.props.recordTracksEvent( 'calypso_jpc_success_redirect', {
				url: url,
				type: type,
			} );
		};

		makeSafeRedirectionFunction( func ) {
			return ( url ) => {
				if ( ! this.state.redirecting ) {
					this.setState( { redirecting: true } );
					func( url );
				}
			};
		}

		goToPlans = this.makeSafeRedirectionFunction( ( url ) => {
			this.recordTracks( url, 'plans_selection' );

			page.redirect( `${ JPC_PATH_PLANS }/${ urlToSlug( url ) }` );
		} );

		goToRemoteAuth = this.makeSafeRedirectionFunction( ( url ) => {
			this.recordTracks( url, 'remote_auth' );
			externalRedirect( addCalypsoEnvQueryArg( url + REMOTE_PATH_AUTH ) );
		} );

		goToRemoteInstall = this.makeSafeRedirectionFunction( ( url ) => {
			this.recordTracks( url, 'remote_install' );

			page.redirect( url );
		} );

		goToInstallInstructions = this.makeSafeRedirectionFunction( ( url ) => {
			const urlWithQuery = addQueryArgs( { url: url }, url );
			this.recordTracks( urlWithQuery, 'install_instructions' );

			page( urlWithQuery );
		} );

		redirectToMobileApp = this.makeSafeRedirectionFunction( ( reason ) => {
			const url = addQueryArgs( { reason }, this.props.mobileAppRedirect );
			debug( `Redirecting to mobile app ${ url }` );
			externalRedirect( url );
		} );

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

		getStatus = ( url ) => {
			if ( url === '' ) {
				return false;
			}

			if ( this.isError( 'site_blacklisted' ) ) {
				return SITE_BLACKLISTED;
			}

			if ( this.checkProperty( 'userOwnsSite' ) ) {
				return ALREADY_OWNED;
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

			if ( this.checkProperty( 'isWordPressDotCom' ) ) {
				const product = window.location.href.split( '/' )[ 5 ];

				if ( startsWith( product, 'jetpack_search' ) ) {
					return IS_DOT_COM_GET_SEARCH;
				}
				return IS_DOT_COM;
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

			return false;
		};

		handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

		isInstall() {
			return includes( FLOW_TYPES, this.props.type );
		}

		render() {
			return (
				<WrappedComponent
					processJpSite={ this.processJpSite }
					status={ this.state.status }
					renderFooter={ this.renderFooter }
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
				isLoggedIn: !! getCurrentUserId( state ),
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
			recordTracksEvent,
		}
	);

	return flowRight( connectComponent, localize )( JetpackConnection );
};

export default jetpackConnection;
