/**
 * External dependencies
 */
import debugModule from 'debug';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight, get, includes, omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import versionCompare from 'calypso/lib/version-compare';
import { addQueryArgs, externalRedirect } from 'calypso/lib/route';
import { checkUrl, dismissUrl } from 'calypso/state/jetpack-connect/actions';
import { getConnectingSite, getJetpackSiteByUrl } from 'calypso/state/jetpack-connect/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { clearPlan, retrieveMobileRedirect, retrievePlan } from './persistence-utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import { redirect } from './utils';
import { IS_DOT_COM_GET_SEARCH, MINIMUM_JETPACK_VERSION } from './constants';
import {
	ALREADY_CONNECTED,
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
			status: '',
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

		processJpSite = ( url ) => {
			const { forceRemoteInstall, isMobileAppFlow, queryArgs, skipRemoteInstall } = this.props;

			const status = this.getStatus( url );

			this.setState( { url, status } );

			if (
				status === NOT_CONNECTED_JETPACK &&
				this.isCurrentUrlFetched() &&
				! forceRemoteInstall &&
				! this.state.redirecting
			) {
				debug( `Redirecting to remote_auth ${ this.props.siteHomeUrl }` );
				this.redirect( 'remote_auth', this.props.siteHomeUrl );
			}

			if ( status === ALREADY_CONNECTED && ! this.state.redirecting ) {
				const currentPlan = retrievePlan();
				clearPlan();
				if ( currentPlan ) {
					debug( `Redirecting to checkout with ${ currentPlan } plan retrieved from cookies` );
					this.redirect( 'checkout', url, currentPlan, queryArgs );
				} else {
					debug( 'Redirecting to plans_selection' );
					this.redirect( 'plans_selection', url );
				}
			}

			if ( this.state.waitingForSites && ! this.props.isRequestingSites ) {
				// eslint-disable-next-line react/no-did-update-set-state
				this.setState( { waitingForSites: false } );
				this.checkUrl( url, status === IS_DOT_COM_GET_SEARCH );
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
					debug( 'Redirecting to remote_install' );
					this.redirect( 'remote_install' );
				} else {
					debug( 'Redirecting to install_instructions' );
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

		redirect = ( type, url, product, queryArgs ) => {
			if ( ! this.state.redirecting ) {
				this.setState( { redirecting: true } );

				redirect( type, url, product, queryArgs );
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

		checkUrl( url, isSearch ) {
			return this.props.checkUrl( url, !! this.props.getJetpackSiteByUrl( url ), isSearch );
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
			return ! this.isCurrentUrlFetching() &&
				this.isCurrentUrlFetched() &&
				! this.props.jetpackConnectSite.isDismissed &&
				this.state.status ? (
				<JetpackConnectNotices
					noticeType={ this.state.status }
					onDismissClick={ IS_DOT_COM === this.state.status ? this.goBack : this.dismissUrl }
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

			if ( ! this.checkProperty( 'isJetpackConnected' ) ) {
				return NOT_CONNECTED_JETPACK;
			}

			return ALREADY_CONNECTED;
		};

		handleOnClickTos = () => this.props.recordTracksEvent( 'calypso_jpc_tos_link_click' );

		render() {
			const props = this.props.locale ? this.props : omit( this.props, 'locale' );

			return (
				<WrappedComponent
					processJpSite={ this.processJpSite }
					status={ this.state.status }
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
