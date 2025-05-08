import { PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { flowRight, get, omit } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { JETPACK_ADMIN_PATH, JPC_A4A_PATH } from 'calypso/jetpack-connect/constants';
import { navigate } from 'calypso/lib/navigate';
import { addQueryArgs } from 'calypso/lib/route';
import { urlToSlug } from 'calypso/lib/url';
import versionCompare from 'calypso/lib/version-compare';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { checkUrl, dismissUrl } from 'calypso/state/jetpack-connect/actions';
import { getConnectingSite, getJetpackSiteByUrl } from 'calypso/state/jetpack-connect/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
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
	NOT_CONNECTED_USER,
} from './connection-notice-types';
import { IS_DOT_COM_GET_SEARCH, MINIMUM_JETPACK_VERSION } from './constants';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import {
	clearPlan,
	retrieveMobileRedirect,
	retrievePlan,
	storePlan,
	storeSource,
	retrieveSource,
	clearSource,
} from './persistence-utils';
import { redirect } from './utils';

const debug = debugModule( 'calypso:jetpack-connect:main' );

const jetpackConnection = ( WrappedComponent ) => {
	class JetpackConnection extends Component {
		state = {
			status: '',
			url: '',
			redirecting: false,
			waitingForSites: true,
		};

		componentDidMount() {
			const { queryArgs } = this.props;
			// If a plan was passed as a query parameter, store it in local storage
			if ( queryArgs && queryArgs.plan ) {
				storePlan( queryArgs.plan );
			}
			if ( queryArgs && queryArgs.source ) {
				storeSource( queryArgs.source );
			}
		}

		/**
		 * Check if there is a history of pages to go back to
		 * @returns {boolean}
		 */
		canGoBack = () => {
			return page.len > 0 || window.history.length > 1;
		};

		renderFooter = () => {
			const { translate } = this.props;
			return (
				<LoggedOutFormLinks>
					<LoggedOutFormLinkItem href="https://jetpack.com/support/installing-jetpack/">
						{ translate( 'Install Jetpack manually' ) }
					</LoggedOutFormLinkItem>
					<HelpButton />
					{ this.canGoBack() && (
						<div className="jetpack-connect__navigation">
							<Button
								compact
								borderless
								className="jetpack-connect__back-button"
								onClick={ this.goBack }
							>
								<Gridicon icon="arrow-left" size={ 18 } />
								{ translate( 'Back' ) }
							</Button>
						</div>
					) }
				</LoggedOutFormLinks>
			);
		};

		dismissUrl = () => this.props.dismissUrl( this.state.url );

		goBack = () => page.back();

		processJpSite = ( url ) => {
			const { forceRemoteInstall, isMobileAppFlow, queryArgs, skipRemoteInstall, fromSource } =
				this.props;

			const status = this.getStatus( url );

			this.setState( { url, status } );

			const source = queryArgs?.source;

			if (
				( status === NOT_CONNECTED_JETPACK || status === NOT_CONNECTED_USER ) &&
				this.isCurrentUrlFetched() &&
				! forceRemoteInstall &&
				! this.state.redirecting
			) {
				debug( `Redirecting to remote_auth ${ this.props.siteHomeUrl }` );
				this.redirect( 'remote_auth', this.props.siteHomeUrl, null, source ? { source } : null );
			}

			if ( status === ALREADY_CONNECTED && ! this.state.redirecting ) {
				const currentPlan = retrievePlan();
				clearPlan();
				if ( source === 'jetpack-manage' ) {
					this.setState( { status: ALREADY_CONNECTED } );
				} else if ( source === 'a8c-for-agencies' ) {
					const urlRedirect = addQueryArgs(
						{ site_already_connected: urlToSlug( this.props.siteHomeUrl ) },
						JPC_A4A_PATH
					);
					navigate( urlRedirect );
					return;
				} else if ( currentPlan ) {
					if ( currentPlan === PLAN_JETPACK_FREE ) {
						debug( `Redirecting to wpadmin` );
						return navigate( this.props.siteHomeUrl + JETPACK_ADMIN_PATH );
					}
					debug( `Redirecting to checkout with ${ currentPlan } plan retrieved from cookies` );
					this.redirect( 'checkout', url, currentPlan, queryArgs );
				} else if ( fromSource === 'import' ) {
					clearSource();
					debug( `Closing the window because the user has connected` );
					window.close();
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
				[ NOT_JETPACK, NOT_ACTIVE_JETPACK ].includes( status ) ||
				( status === NOT_CONNECTED_JETPACK && forceRemoteInstall )
			) {
				if ( ! isMobileAppFlow && ! skipRemoteInstall ) {
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
				navigate( url );
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

			if ( this.isError( 'connection_disabled' ) ) {
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

			if ( this.props.fromSource === 'import' && ! this.checkProperty( 'userOwnsSite' ) ) {
				return NOT_CONNECTED_USER;
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
			const fromSource = retrieveSource();

			return {
				// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
				getJetpackSiteByUrl: ( url ) => getJetpackSiteByUrl( state, url ),
				isMobileAppFlow,
				isRequestingSites: isRequestingSites( state ),
				jetpackConnectSite,
				mobileAppRedirect,
				skipRemoteInstall,
				siteHomeUrl: siteData.urlAfterRedirects || jetpackConnectSite.url,
				fromSource,
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
