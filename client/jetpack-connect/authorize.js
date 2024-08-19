import config from '@automattic/calypso-config';
import {
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	WPCOM_FEATURES_BACKUPS,
	getJetpackProductOrPlanDisplayName,
} from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Button, Card, FormLabel, Gridicon, Spinner, JetpackLogo } from '@automattic/components';
import { Spinner as WPSpinner, Modal } from '@wordpress/components';
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import { flowRight, get, includes, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { formatSlugToURL } from 'calypso/blocks/importer/util';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserConnection from 'calypso/components/data/query-user-connection';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import Gravatar from 'calypso/components/gravatar';
import LoggedOutFormFooter from 'calypso/components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import LoggedOutFormLinks from 'calypso/components/logged-out-form/links';
import { decodeEntities } from 'calypso/lib/formatting';
import { navigate } from 'calypso/lib/navigate';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/route';
import { urlToSlug } from 'calypso/lib/url';
import { clearStore, disablePersistence } from 'calypso/lib/user/store';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	authorize as authorizeAction,
	retryAuth as retryAuthAction,
} from 'calypso/state/jetpack-connect/actions';
import {
	getAuthAttempts,
	getAuthorizationData,
	getUserAlreadyConnected,
	hasExpiredSecretError as hasExpiredSecretErrorSelector,
	hasXmlrpcError as hasXmlrpcErrorSelector,
	isRemoteSiteOnSitesList,
	isSiteBlockedError as isSiteBlockedSelector,
} from 'calypso/state/jetpack-connect/selectors';
import { logoutUser } from 'calypso/state/logout/actions';
import {
	isFetchingSitePurchases,
	siteHasJetpackProductPurchase,
} from 'calypso/state/purchases/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getPartnerIdFromQuery from 'calypso/state/selectors/get-partner-id-from-query';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSite, isRequestingSite, isRequestingSites } from 'calypso/state/sites/selectors';
import AuthFormHeader from './auth-form-header';
import {
	ALREADY_CONNECTED,
	ALREADY_CONNECTED_BY_OTHER_USER,
	DEFAULT_AUTHORIZE_ERROR,
	RETRY_AUTH,
	RETRYING_AUTH,
	SECRET_EXPIRED,
	SITE_BLOCKED,
	USER_IS_ALREADY_CONNECTED_TO_SITE,
	XMLRPC_ERROR,
} from './connection-notice-types';
import {
	JPC_A4A_PATH,
	JPC_JETPACK_MANAGE_PATH,
	JPC_PATH_PLANS,
	JPC_PATH_PLANS_COMPLETE,
	REMOTE_PATH_AUTH,
} from './constants';
import Disclaimer from './disclaimer';
import { JetpackFeatures } from './features';
import { OFFER_RESET_FLOW_TYPES } from './flow-types';
import HelpButton from './help-button';
import JetpackConnectNotices from './jetpack-connect-notices';
import MainWrapper from './main-wrapper';
import {
	clearPlan,
	isCalypsoStartedConnection,
	isSsoApproved,
	retrieveMobileRedirect,
	retrievePlan,
	retrieveSource,
	clearSource,
} from './persistence-utils';
import AuthorizationScreenReaderIndicator from './screen-reader-indicator';
import { authQueryPropTypes, getRoleFromScope } from './utils';
import wooDnaConfig from './woo-dna-config';
import WooInstallExtSuccessNotice from './woo-install-ext-success-notice';
import { WooLoader } from './woo-loader';
import { ConnectingYourAccountStage, OpeningTheDoorsStage } from './woo-loader-stages';

/**
 * Constants
 */
const debug = debugModule( 'calypso:jetpack-connect:authorize-form' );
const MAX_AUTH_ATTEMPTS = 3;

export class JetpackAuthorize extends Component {
	static propTypes = {
		authQuery: authQueryPropTypes.isRequired,

		// Connected props
		authAttempts: PropTypes.number.isRequired,
		authorizationData: PropTypes.shape( {
			authorizationCode: PropTypes.string,
			authorizeError: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
			authorizeSuccess: PropTypes.bool,
			siteReceived: PropTypes.bool,
		} ).isRequired,
		authorize: PropTypes.func.isRequired,
		calypsoStartedConnection: PropTypes.bool,
		hasExpiredSecretError: PropTypes.bool,
		hasXmlrpcError: PropTypes.bool,
		isAlreadyOnSitesList: PropTypes.bool,
		isFetchingAuthorizationSite: PropTypes.bool,
		isFetchingSites: PropTypes.bool,
		isSiteBlocked: PropTypes.bool,
		isRequestingSitePurchases: PropTypes.bool,
		recordTracksEvent: PropTypes.func.isRequired,
		siteHasJetpackPaidProduct: PropTypes.bool,
		retryAuth: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired,
		userAlreadyConnected: PropTypes.bool.isRequired,
	};

	redirecting = false;
	retryingAuth = false;

	state = {
		isRedirecting: false,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		const { recordTracksEvent, isMobileAppFlow } = this.props;

		const { from, clientId, closeWindowAfterLogin } = this.props.authQuery;
		const tracksProperties = {
			from,
			is_mobile_app_flow: isMobileAppFlow,
			site: clientId,
		};

		if ( closeWindowAfterLogin && typeof window !== 'undefined' ) {
			// Certain connection flows may complete the login step within a popup window.
			// In these cases, we'll want to automatically close the window when the login
			// step is complete, and continue authorization in the parent window.
			debug( 'Closing window after login' );
			window.close();
		}

		recordTracksEvent( 'calypso_jpc_authorize_form_view', tracksProperties );
		recordTracksEvent( 'calypso_jpc_auth_view', tracksProperties );

		if ( this.shouldAutoAuthorize() ) {
			debug( 'Authorizing automatically on component mount' );
			return this.authorize();
		}
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		const { retryAuth } = nextProps;
		const { authorizeError, authorizeSuccess, siteReceived } = nextProps.authorizationData;
		const { alreadyAuthorized, redirectAfterAuth, site } = nextProps.authQuery;

		if ( this.isJetpackPartnerCoupon( nextProps ) && ( siteReceived || authorizeSuccess ) ) {
			// The current implementation of the partner coupon URL is supposed to
			// just take over the entire flow and send directly to checkout.
			// This will happen by the partnerCouponRedirects controller logic if we
			// just redirect the customer to the plans page.
			// The reason we have to do this is because e.g. "shouldRedirectJetpackStart" has
			// logic that will always go straight to the redirect URI after authorization which
			// means we never hit the "plans" page where our partner coupon logic takes over.
			return this.redirect();
		} else if (
			this.isSso( nextProps ) ||
			this.isWooRedirect( nextProps ) ||
			this.isFromJpo( nextProps ) ||
			this.isFromJetpackBoost( nextProps ) ||
			this.shouldRedirectJetpackStart( nextProps ) ||
			this.isFromBlazeAdsPlugin( nextProps ) ||
			this.props.isVip
		) {
			if ( authorizeSuccess ) {
				return this.externalRedirectOnce( redirectAfterAuth );
			}
		} else if ( siteReceived ) {
			return this.redirect();
		} else if ( nextProps.isAlreadyOnSitesList && alreadyAuthorized ) {
			return this.redirect();
		}
		if (
			authorizeError &&
			nextProps.authAttempts < MAX_AUTH_ATTEMPTS &&
			! this.retryingAuth &&
			! nextProps.hasXmlrpcError &&
			! nextProps.hasExpiredSecretError &&
			! nextProps.isSiteBlocked &&
			site
		) {
			// Expired secret errors, and XMLRPC errors will be resolved in `handleResolve`.
			// Any other type of error, we will immediately and automatically retry the request as many times
			// as controlled by MAX_AUTH_ATTEMPTS.
			const attempts = this.props.authAttempts || 0;
			this.retryingAuth = true;
			return retryAuth( site, attempts + 1, nextProps.authQuery.from, redirectAfterAuth );
		}
	}

	authorize() {
		this.props.authorize( {
			_wp_nonce: this.props.authQuery.nonce,
			client_id: this.props.authQuery.clientId,
			from: this.props.authQuery.from,
			jp_version: this.props.authQuery.jpVersion,
			redirect_uri: this.props.authQuery.redirectUri,
			scope: this.props.authQuery.scope,
			secret: this.props.authQuery.secret,
			state: this.props.authQuery.state,
		} );
	}

	externalRedirectOnce( url ) {
		if ( ! this.redirecting ) {
			this.redirecting = true;
			debug( `Redirecting to ${ url }` );
			navigate( url );
		}
	}

	redirect() {
		const { isMobileAppFlow, mobileAppRedirect, siteHasBackups, fromSource } = this.props;
		const { from, homeUrl, redirectAfterAuth, scope, closeWindowAfterAuthorize } =
			this.props.authQuery;
		const { isRedirecting } = this.state;

		if ( isRedirecting ) {
			return;
		}

		if ( isMobileAppFlow ) {
			debug( `Redirecting to mobile app ${ mobileAppRedirect }` );
			window.location.replace( mobileAppRedirect );
			return;
		}

		if ( closeWindowAfterAuthorize && typeof window !== 'undefined' ) {
			// Certain connection flows may complete the authorization step within a popup window.
			// In these cases, we'll want to automatically close the window when the authorization
			// step is complete, and have the window opener detect this and re-check user authorization status.
			debug( 'Closing window after authorize' );
			window.close();
		}

		if ( fromSource === 'import' ) {
			clearSource();
			debug( 'Closing window after authorize - from migration flow' );
			window.close();
		}

		const urlParams = new URLSearchParams( window.location.search );
		const source = urlParams.get( 'source' );

		if ( source === 'jetpack-manage' ) {
			const urlRedirect = addQueryArgs(
				{ site_connected: urlToSlug( homeUrl ) },
				JPC_JETPACK_MANAGE_PATH
			);
			navigate( urlRedirect );
			return;
		} else if ( source === 'a8c-for-agencies' ) {
			const urlRedirect = addQueryArgs( { site_connected: urlToSlug( homeUrl ) }, JPC_A4A_PATH );
			navigate( urlRedirect );
			return;
		}

		if ( this.isJetpackPartnerCoupon() ) {
			// The current implementation of the partner coupon URL is supposed to
			// just take over the entire flow and send directly to checkout.
			// This will happen by the partnerCouponRedirects controller logic if we
			// just redirect the customer to the plans page.
			// The reason we have to do this is because e.g. "shouldRedirectJetpackStart" has
			// logic that will always go straight to the redirect URI after authorization which
			// means we never hit the "plans" page where our partner coupon logic takes over.
			const redirectionTarget = addQueryArgs(
				{ redirect: redirectAfterAuth },
				`${ JPC_PATH_PLANS }/${ urlToSlug( homeUrl ) }`
			);
			debug( `Jetpack Partner Coupon Redirecting to: ${ redirectionTarget }` );
			navigate( redirectionTarget );
		} else if (
			this.isSso() ||
			this.isWooRedirect() ||
			this.isFromJpo() ||
			this.isFromJetpackBoost() ||
			this.isFromBlockEditor() ||
			this.shouldRedirectJetpackStart() ||
			getRoleFromScope( scope ) === 'subscriber' ||
			this.isJetpackUpgradeFlow() ||
			this.isFromJetpackConnectionManager() ||
			this.isFromJetpackSocialPlugin() ||
			this.isFromJetpackSearchPlugin() ||
			this.isFromJetpackVideoPressPlugin() ||
			( this.isFromJetpackBackupPlugin() && siteHasBackups ) ||
			this.isFromAutomatticForAgenciesPlugin() ||
			this.isFromBlazeAdsPlugin()
		) {
			debug(
				'Going back to WP Admin.',
				'Connection initiated via: ',
				from,
				'SSO found:',
				this.isSso()
			);
			this.externalRedirectOnce( redirectAfterAuth );
		} else if ( this.isFromMyJetpackConnectAfterCheckout() ) {
			debug( `Redirecting to Calypso product license activation page: ${ redirectAfterAuth }` );
			navigate(
				// The /jetpack/connect/authorize controller requires `redirectAfterAuth` to be a
				// valid well-formed uri (via validUrl.isWebUri()), so here we are removing the url
				// host so that it becomes a relative url.
				redirectAfterAuth.replace(
					/^(https?:\/\/wordpress\.com|http:\/\/calypso\.localhost:3000)/,
					''
				)
			);
		} else if ( this.isFromJetpackBackupPlugin() && ! siteHasBackups ) {
			debug( `Redirecting directly to cart with ${ PRODUCT_JETPACK_BACKUP_T1_YEARLY } in cart.` );
			navigate( `/checkout/${ urlToSlug( homeUrl ) }/${ PRODUCT_JETPACK_BACKUP_T1_YEARLY }` );
		} else if ( this.isFromMigrationPlugin() ) {
			navigate( `/setup/hosted-site-migration?ref=jetpack-connect&from=${ urlToSlug( homeUrl ) }` );
		} else {
			const redirectionTarget = this.getRedirectionTarget();
			debug( `Redirecting to: ${ redirectionTarget }` );
			navigate( redirectionTarget );
		}

		this.setState( { isRedirecting: true } );
	}

	redirectToXmlRpcErrorFallbackUrl() {
		const { state, redirectUri } = this.props.authQuery;
		const code = this.props.authorizationData.authorizationCode;
		const url = addQueryArgs( { code, state }, redirectUri );
		debug( 'xmlrpc fallback to', url );
		this.externalRedirectOnce( url );
	}

	shouldAutoAuthorize() {
		const { alreadyAuthorized, authApproved, from } = this.props.authQuery;
		return (
			this.isSso() ||
			[ 'woocommerce-services-auto-authorize', 'woocommerce-setup-wizard' ].includes( from ) || // Auto authorize the old WooCommerce setup wizard only.
			( ! this.props.isAlreadyOnSitesList &&
				! alreadyAuthorized &&
				( this.props.calypsoStartedConnection || authApproved ) )
		);
	}

	isFromJpo( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jpo' );
	}

	isFromJetpackBoost( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-boost' );
	}

	isFromBlockEditor( props = this.props ) {
		const { from } = props.authQuery;
		return 'jetpack-block-editor' === from;
	}

	/**
	 * Check whether this a valid authorized SSO request
	 * @param  {Object}  props          Props to test
	 * @param  {?string} props.authQuery.from     Where is the request from
	 * @param  {?number} props.authQuery.clientId Remote site ID
	 * @returns {boolean}                True if it's a valid SSO request otherwise false
	 */
	isSso( props = this.props ) {
		const { from, clientId } = props.authQuery;
		return 'sso' === from && isSsoApproved( clientId );
	}

	/**
	 * Check if the user is coming from the Jetpack upgrade flow.
	 * @param  {Object}  props           Props to test
	 * @param  {?string} props.authQuery.redirectAfterAuth Where were we redirected after auth.
	 * @returns {boolean}                True if the user is coming from the Jetpack upgrade flow, false otherwise.
	 */
	isJetpackUpgradeFlow( props = this.props ) {
		const { redirectAfterAuth } = props.authQuery;
		return (
			redirectAfterAuth && redirectAfterAuth.includes( 'page=jetpack&action=authorize_redirect' )
		);
	}

	isFromJetpackConnectionManager( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'connection-ui' );
	}

	isFromJetpackBackupPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-backup' );
	}

	isFromJetpackSearchPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-search' );
	}

	isFromJetpackSocialPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-social' );
	}

	isFromJetpackVideoPressPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-videopress' );
	}

	isFromMyJetpack( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'my-jetpack' );
	}

	isWooRedirect = ( props = this.props ) => {
		const { from } = props.authQuery;
		return (
			[
				'woocommerce-services-auto-authorize',
				'woocommerce-setup-wizard',
				'woocommerce-onboarding',
				'woocommerce-core-profiler',
			].includes( from ) || this.getWooDnaConfig( props ).isWooDnaFlow()
		);
	};

	isWooOnboarding( props = this.props ) {
		const { from } = props.authQuery;
		return 'woocommerce-onboarding' === from;
	}

	isWooCoreProfiler( props = this.props ) {
		const { from } = props.authQuery;
		return 'woocommerce-core-profiler' === from;
	}

	getWooDnaConfig( props = this.props ) {
		return wooDnaConfig( props.authQuery );
	}

	isJetpackPartnerCoupon( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'jetpack-partner-coupon' );
	}

	isFromMigrationPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'wpcom-migration' );
	}

	isFromAutomatticForAgenciesPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'automattic-for-agencies-client' );
	}

	isFromBlazeAdsPlugin( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'blaze-ads' );
	}

	shouldRedirectJetpackStart( props = this.props ) {
		const { partnerSlug, partnerID } = props;

		return partnerID && 'pressable' !== partnerSlug;
	}

	isFromMyJetpackConnectAfterCheckout( props = this.props ) {
		const { from } = props.authQuery;
		return startsWith( from, 'connect-after-checkout' );
	}

	getCompanyName() {
		return this.isFromAutomatticForAgenciesPlugin() ? 'Automattic, Inc.' : 'WordPress.com';
	}

	handleSignIn = async ( e, loginURL ) => {
		e.preventDefault();

		const { recordTracksEvent } = this.props;
		switch ( true ) {
			case this.isWooOnboarding():
				recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { use_account: true } );
				window.location.href = e.target.href;
				break;
			case this.isWooCoreProfiler():
				recordTracksEvent( 'calypso_jpc_wc_coreprofiler_different_user_click' );
				window.location.href = e.target.href;
				break;
			default:
				try {
					const { redirect_to: redirectTo } = await this.props.logoutUser( loginURL );
					disablePersistence();
					await clearStore();
					window.location.href = redirectTo || '/';
				} catch ( error ) {
					// The logout endpoint might fail if the nonce has expired.
					// In this case, redirect to wp-login.php?action=logout to get a new nonce generated
					this.props.redirectToLogout( loginURL );
				}
		}
	};

	handleSignOut = () => {
		const { recordTracksEvent } = this.props;
		const { from } = this.props.authQuery;
		recordTracksEvent( 'calypso_jpc_signout_click' );

		if ( 'woocommerce-onboarding' === from ) {
			recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { create_jetpack: true } );
		}

		this.props.redirectToLogout( window.location.href );
	};

	handleResolve = () => {
		const { site, recordTracksEvent } = this.props;
		this.retryingAuth = false;
		if ( this.props.hasExpiredSecretError ) {
			// In this case, we need to re-issue the secret.
			// We do this by redirecting to Jetpack client, which will automatically redirect back here.
			recordTracksEvent( 'calypso_jpc_resolve_expired_secret_error_click' );
			this.externalRedirectOnce( site + REMOTE_PATH_AUTH );
			return;
		}
		// Otherwise, we assume the site is having trouble receive XMLRPC requests.
		// To resolve, we redirect to the Jetpack Client, and attempt to complete the connection with
		// legacy functions on the client.
		recordTracksEvent( 'calypso_jpc_resolve_xmlrpc_error_click' );
		this.redirectToXmlRpcErrorFallbackUrl();
	};

	handleSubmit = () => {
		const { recordTracksEvent } = this.props;
		const { authorizeError, authorizeSuccess } = this.props.authorizationData;
		const { alreadyAuthorized, redirectAfterAuth, from } = this.props.authQuery;

		if ( ! this.props.isAlreadyOnSitesList && ! this.props.isFetchingSites && alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_back_wpadmin_click' );
			return this.externalRedirectOnce( redirectAfterAuth );
		}

		if ( this.props.isAlreadyOnSitesList && alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_already_authorized_click' );
			return this.redirect();
		}

		if ( authorizeSuccess && ! alreadyAuthorized ) {
			recordTracksEvent( 'calypso_jpc_activate_click' );
			return this.redirect();
		}
		if ( authorizeError ) {
			recordTracksEvent( 'calypso_jpc_try_again_click' );
			return this.handleResolve();
		}
		if ( this.props.isAlreadyOnSitesList ) {
			recordTracksEvent( 'calypso_jpc_return_site_click' );
			return this.redirect();
		}

		recordTracksEvent( 'calypso_jpc_approve_click' );

		if ( 'woocommerce-onboarding' === from ) {
			recordTracksEvent( 'wcadmin_storeprofiler_connect_store', { use_account: true } );
		}

		if ( 'woocommerce-core-profiler' === from ) {
			recordTracksEvent( 'calypso_jpc_wc_coreprofiler_connect', { use_account: true } );
		}

		return this.authorize();
	};

	isAuthorizing() {
		const { isAuthorizing } = this.props.authorizationData;
		return ! this.props.isAlreadyOnSitesList && isAuthorizing;
	}

	renderErrorDetails() {
		const { authorizeError } = this.props.authorizationData;
		return (
			<div className="jetpack-connect__error-details">
				<FormLabel>{ this.props.translate( 'Error Details' ) }</FormLabel>
				<FormSettingExplanation>{ authorizeError.message }</FormSettingExplanation>
			</div>
		);
	}

	renderXmlrpcFeedback() {
		const { translate } = this.props;

		return (
			<p>
				{ translate(
					'WordPress.com was unable to reach your site and approve the connection. ' +
						'Try again by clicking the button above; ' +
						"if that doesn't work you may need to {{link}}contact support{{/link}}.",
					{
						components: {
							link: (
								<a
									href="https://jetpack.com/contact-support"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</p>
		);
	}

	renderNotices() {
		const { authorizeError, isAuthorizing, authorizeSuccess, userAlreadyConnected } =
			this.props.authorizationData;
		const { alreadyAuthorized, site } = this.props.authQuery;

		let redirectToMobileApp = null;
		if ( this.props.isMobileAppFlow ) {
			redirectToMobileApp = ( reason ) => {
				const url = addQueryArgs( { reason }, this.props.mobileAppRedirect );
				this.externalRedirectOnce( url );
			};
		}

		if ( alreadyAuthorized && ! this.props.isFetchingSites && ! this.props.isAlreadyOnSitesList ) {
			// For users who start their journey at `wordpress.com/jetpack/connect` or similar flows, we will discourage
			// additional users from linking. Although it is possible to link multiple users with Jetpack, the `jetpack/connect`
			// flows will be reserved for brand new connections.
			return (
				<JetpackConnectNotices
					noticeType={ ALREADY_CONNECTED_BY_OTHER_USER }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if ( userAlreadyConnected ) {
			// Via wp-admin it is possible to connect additional users after the initial connection is made. But if we
			// are trying to connect an additional user, and we are logged into a wordpress.com account that is already
			// connected, we need to show an error.
			return (
				<JetpackConnectNotices
					noticeType={ USER_IS_ALREADY_CONNECTED_TO_SITE }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if ( this.retryingAuth ) {
			return (
				<JetpackConnectNotices
					noticeType={ RETRYING_AUTH }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}

		if (
			this.props.authAttempts < MAX_AUTH_ATTEMPTS &&
			this.props.authAttempts > 0 &&
			! isAuthorizing &&
			! authorizeSuccess
		) {
			return (
				<JetpackConnectNotices noticeType={ RETRY_AUTH } onTerminalError={ redirectToMobileApp } />
			);
		}

		if ( ! authorizeError ) {
			return null;
		}

		if ( includes( get( authorizeError, 'message' ), 'already_connected' ) ) {
			return (
				<JetpackConnectNotices
					noticeType={ ALREADY_CONNECTED }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		if ( this.props.hasExpiredSecretError ) {
			return (
				<JetpackConnectNotices
					noticeType={ SECRET_EXPIRED }
					siteUrl={ site }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		if ( this.props.hasXmlrpcError ) {
			return (
				<Fragment>
					<JetpackConnectNotices
						noticeType={ XMLRPC_ERROR }
						onActionClick={ this.handleResolve }
						onTerminalError={ redirectToMobileApp }
					/>
					{ this.renderXmlrpcFeedback() }
					{ this.renderErrorDetails() }
				</Fragment>
			);
		}
		if ( this.props.isSiteBlocked ) {
			return (
				<JetpackConnectNotices
					noticeType={ SITE_BLOCKED }
					onTerminalError={ redirectToMobileApp }
				/>
			);
		}
		return (
			<Fragment>
				<JetpackConnectNotices
					noticeType={ DEFAULT_AUTHORIZE_ERROR }
					onTerminalError={ redirectToMobileApp }
				/>
				{ this.renderErrorDetails() }
			</Fragment>
		);
	}

	getButtonText() {
		// Update getScreenReaderAuthMessage if you change this function.
		// TODO: extract actual status messages from button labels so getScreenReaderAuthMessage can use them.
		const { translate } = this.props;
		const { authorizeError, authorizeSuccess, isAuthorizing } = this.props.authorizationData;
		const { alreadyAuthorized } = this.props.authQuery;

		if ( this.isFromMigrationPlugin() ) {
			if ( this.props.isFetchingAuthorizationSite ) {
				return translate( 'Preparing authorization' );
			}

			return translate( 'Continue' );
		}

		if ( ! this.props.isAlreadyOnSitesList && ! this.props.isFetchingSites && alreadyAuthorized ) {
			return translate( 'Go back to your site' );
		}

		if ( authorizeError && ! this.retryingAuth ) {
			return translate( 'Try again' );
		}

		if ( this.props.isFetchingAuthorizationSite ) {
			return translate( 'Preparing authorization' );
		}

		if ( authorizeSuccess && this.redirecting ) {
			return translate( 'Returning to your site' );
		}

		if ( authorizeSuccess ) {
			return translate( 'Finishing up!', {
				context:
					'Shown during a jetpack authorization process, while we retrieve the info we need to show the last page',
			} );
		}

		if ( isAuthorizing || this.retryingAuth ) {
			return translate( 'Authorizing your connection' );
		}

		if ( this.props.isAlreadyOnSitesList ) {
			return translate( 'Return to your site' );
		}

		if ( this.isWooCoreProfiler() ) {
			return translate( 'Connect your account' );
		}

		if ( ! this.retryingAuth ) {
			return translate( 'Approve' );
		}
	}

	getScreenReaderAuthMessage() {
		// Copied from getButtonText. Buttons labels have been removed and actual status messages kept.
		const { translate } = this.props;
		const { authorizeError, authorizeSuccess, isAuthorizing } = this.props.authorizationData;
		const { alreadyAuthorized } = this.props.authQuery;

		if ( this.isFromMigrationPlugin() ) {
			if ( this.props.isFetchingAuthorizationSite ) {
				return translate( 'Preparing authorization' );
			}

			return;
		}

		if ( ! this.props.isAlreadyOnSitesList && ! this.props.isFetchingSites && alreadyAuthorized ) {
			return;
		}

		if ( authorizeError && ! this.retryingAuth ) {
			return;
		}

		if ( this.props.isFetchingAuthorizationSite ) {
			return translate( 'Preparing authorization' );
		}

		if ( authorizeSuccess && this.redirecting ) {
			return;
		}

		if ( authorizeSuccess ) {
			return translate( 'Finishing up!', {
				context:
					'Shown during a jetpack authorization process, while we retrieve the info we need to show the last page',
			} );
		}

		if ( isAuthorizing || this.retryingAuth ) {
			return translate( 'Authorizing your connection' );
		}
	}

	getUserText() {
		const { translate } = this.props;
		const { authorizeSuccess } = this.props.authorizationData;
		const isWpcomMigration = this.isFromMigrationPlugin();

		if ( isWpcomMigration ) {
			const { display_name, email } = this.props.user;
			return (
				<>
					<strong>{ display_name }</strong>
					<br />
					<small>{ email }</small>
				</>
			);
		}

		if ( this.isWooCoreProfiler() ) {
			return (
				<>
					{ translate( 'Connecting as %(user)s', {
						args: { user: this.props.user.display_name },
					} ) }
					<br />
					<small>{ this.props.user.email }</small>
				</>
			);
		}

		// Accounts created through the new Magic Link-based signup flow (enabled with the
		// 'jetpack/magic-link-signup' feature flag) are created with a username based on the user's
		// email address. For this reason, we want to display both the username and the email address
		// so users can start making the connection between the two immediately. Otherwise, users might
		// not recognize their username since they didn't created it.

		// translators: %(user) is user's Display Name (Eg Connecting as John Doe) and %(email) is the user's email address
		let text = translate(
			'Connecting as {{strong}}%(user)s{{/strong}} ({{strong}}%(email)s{{/strong}})',
			{
				args: { email: this.props.user.email, user: this.props.user.display_name },
				components: { strong: <strong /> },
			}
		);

		if ( authorizeSuccess || this.props.isAlreadyOnSitesList ) {
			// translators: %(user) is user's Display Name (Eg Connecting as John Doe) and %(email) is the user's email address
			text = translate(
				'Connected as {{strong}}%(user)s{{/strong}} ({{strong}}%(email)s{{/strong}})',
				{
					args: { email: this.props.user.email, user: this.props.user.display_name },
					components: { strong: <strong /> },
				}
			);
		}

		return text;
	}

	getProductActivationText() {
		if ( ! this.isFromMyJetpackConnectAfterCheckout() ) {
			return;
		}
		const { translate, isAlreadyOnSitesList } = this.props;
		const { authorizeSuccess } = this.props.authorizationData;
		const { redirectAfterAuth } = this.props.authQuery;

		const { searchParams } = getUrlParts( redirectAfterAuth );
		const productSlug = searchParams.get( 'productSlug' );
		const siteSlug = searchParams.get( 'fromSiteSlug' );
		const siteName = formatSlugToURL( siteSlug ).replace( /^https?:\/\//, '' );
		const productName = getJetpackProductOrPlanDisplayName( productSlug );

		// Do nothing if we don't have a product name here
		if ( ! productName ) {
			return null;
		}

		if ( authorizeSuccess || isAlreadyOnSitesList ) {
			return translate(
				'You purchased {{strong}}%(productName)s{{/strong}}. Now you can activate it on website {{strong}}%(siteName)s{{/strong}}',
				{
					args: { productName, siteName },
					components: {
						br: <br />,
						strong: <strong />,
					},
				}
			);
		}

		return translate(
			'You purchased {{strong}}%(productName)s{{/strong}}. Once connected, you can activate it on website {{strong}}%(siteName)s{{/strong}}',
			{
				args: { productName, siteName },
				components: {
					br: <br />,
					strong: <strong />,
				},
			}
		);
	}

	isWaitingForConfirmation() {
		const { isAuthorizing, authorizeSuccess, siteReceived } = this.props.authorizationData;
		return ! ( isAuthorizing || authorizeSuccess || siteReceived );
	}

	getRedirectionTarget() {
		const { clientId, homeUrl, redirectAfterAuth } = this.props.authQuery;
		const { partnerSlug, selectedPlanSlug, siteHasJetpackPaidProduct } = this.props;

		// Redirect sites hosted on Pressable with a partner plan to some URL.
		if ( 'pressable' === partnerSlug ) {
			const pressableTarget = `/start/pressable-nux?blogid=${ clientId }`;
			debug(
				'authorization-form: getRedirectionTarget -> This is a Pressable site, redirection target is: %s',
				pressableTarget
			);
			return pressableTarget;
		}

		// If the redirect is part of a Jetpack plan or product go to the checkout page
		const jetpackCheckoutSlugs = OFFER_RESET_FLOW_TYPES.filter( ( productSlug ) =>
			productSlug.includes( 'jetpack' )
		);
		if ( jetpackCheckoutSlugs.includes( selectedPlanSlug ) ) {
			const checkoutTarget = `/checkout/${ urlToSlug( homeUrl ) }/${ selectedPlanSlug }`;
			// Once we decide we want to redirect the user to the checkout page and that there is a
			// valid plan, we can safely remove it from the session storage
			clearPlan();
			debug(
				'authorization-form: getRedirectionTarget -> Valid plan retrived from localStorage, redirection target is: %s',
				checkoutTarget
			);
			return `/checkout/${ urlToSlug( homeUrl ) }/${ selectedPlanSlug }`;
		}

		// If the site has a Jetpack paid product send the user back to wp-admin rather than to the Plans page.
		if ( siteHasJetpackPaidProduct ) {
			debug(
				'authorization-form: getRedirectionTarget -> Site already has a paid product, redirection target is: %s',
				redirectAfterAuth
			);
			return redirectAfterAuth;
		}

		// We naviage users to complete page if it's not a multisite and feature flag activated
		if ( config.isEnabled( 'jetpack/offer-complete-after-activation' ) ) {
			const isMultisite = this.props.site && this.props.site.is_multisite;
			if ( ! isMultisite && this.props.site ) {
				const jpcTargetComplete = `${ JPC_PATH_PLANS_COMPLETE }/${ urlToSlug( homeUrl ) }`;
				debug(
					'authorization-form: getRedirectionTarget -> Redirection target is: %s',
					jpcTargetComplete
				);
				return jpcTargetComplete;
			}
		}

		const jpcTarget = addQueryArgs(
			{ redirect: redirectAfterAuth },
			`${ JPC_PATH_PLANS }/${ urlToSlug( homeUrl ) }`
		);
		debug( 'authorization-form: getRedirectionTarget -> Redirection target is: %s', jpcTarget );
		return jpcTarget;
	}

	renderContent() {
		const { translate, user, authQuery } = this.props;
		if ( this.isWooCoreProfiler() ) {
			let col1Features = [];
			let col2Features = [];
			if ( authQuery.plugin_name === 'jetpack-boost' ) {
				col1Features = [
					translate( 'Speed up your store' ),
					translate( 'Optimize CSS loading' ),
					translate( 'Defer non-essential Javascript' ),
				];
				col2Features = [
					translate( 'Lazy image loading' ),
					translate( 'Site performance scores' ),
					translate( 'Improve SEO' ),
				];
			} else {
				col1Features = [
					translate( 'Speed up content creation' ),
					translate( 'Prompt based AI assistant' ),
					translate( 'Adaptive tone adjustment' ),
					translate( 'Generate text, tables, and lists' ),
				];
				col2Features = [
					translate( 'Quota of 20 requests' ),
					translate( 'Title and summary generation' ),
					translate( 'Translate content to multiple languages' ),
					translate( 'Spelling and grammar correction' ),
				];
			}

			return (
				<Fragment>
					<div className="jetpack-connect__logged-in-content">
						<Card className="jetpack-connect__logged-in-card">
							<div className="jetpack-connect__logged-in-form-user">
								<Gravatar user={ user } size={ 40 } />
								<p className="jetpack-connect__logged-in-form-user-text">{ this.getUserText() }</p>
							</div>
							<LoggedOutFormLinkItem
								href={ login( {
									isJetpack: true,
									redirectTo: window.location.href,
									from: authQuery.from,
								} ) }
								onClick={ this.handleSignIn }
							>
								{ translate( 'Sign in as a different user' ) }
							</LoggedOutFormLinkItem>
						</Card>
						<div className="jetpack-connect__logged-in-bottom">
							{ this.renderStateAction() }
							<JetpackFeatures col1Features={ col1Features } col2Features={ col2Features } />
							<Disclaimer
								siteName={ decodeEntities( authQuery.blogname ) }
								companyName={ this.getCompanyName() }
								from={ authQuery.from }
							/>
							<div className="jetpack-connect__jetpack-logo-wrapper">
								<JetpackLogo monochrome size={ 18 } />{ ' ' }
								<span>{ translate( 'Jetpack powered' ) }</span>
							</div>
						</div>
					</div>
					{ authQuery.installedExtSuccess && <WooInstallExtSuccessNotice /> }
				</Fragment>
			);
		}

		const gravatarSize = this.isFromMigrationPlugin() ? 94 : 64;

		return (
			<Card className="jetpack-connect__logged-in-card">
				<Gravatar user={ user } size={ gravatarSize } />
				<p className="jetpack-connect__logged-in-form-user-text">{ this.getUserText() }</p>
				{ this.isFromMyJetpackConnectAfterCheckout() && (
					<p className="jetpack-connect__activate-product-text">
						{ this.getProductActivationText() }
					</p>
				) }
				{ this.renderNotices() }
				{ this.renderStateAction() }
			</Card>
		);
	}

	renderFooterLinks() {
		const { translate } = this.props;
		const { authorizeSuccess, isAuthorizing } = this.props.authorizationData;
		const { from } = this.props.authQuery;
		const isJetpackMagicLinkSignUpFlow = config.isEnabled( 'jetpack/magic-link-signup' );

		if (
			this.retryingAuth ||
			isAuthorizing ||
			authorizeSuccess ||
			this.redirecting ||
			this.isWooCoreProfiler()
		) {
			return null;
		}

		const wooDnaFooterLinks = this.renderWooDnaFooterLinks();
		if ( wooDnaFooterLinks ) {
			return wooDnaFooterLinks;
		}

		const loginURL = login( { isJetpack: true, redirectTo: window.location.href, from } );

		return (
			<LoggedOutFormLinks>
				{ ! isJetpackMagicLinkSignUpFlow && this.renderBackToWpAdminLink() }
				<LoggedOutFormLinkItem
					href={ loginURL }
					onClick={ ( e ) => this.handleSignIn( e, loginURL ) }
				>
					{ translate( 'Sign in as a different user' ) }
				</LoggedOutFormLinkItem>
				{ ! isJetpackMagicLinkSignUpFlow && (
					<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
						{ translate( 'Create a new account' ) }
					</LoggedOutFormLinkItem>
				) }
				{ ! isJetpackMagicLinkSignUpFlow && <HelpButton /> }
			</LoggedOutFormLinks>
		);
	}

	renderWooDnaFooterLinks() {
		const { translate } = this.props;
		const wooDna = this.getWooDnaConfig();
		if ( ! wooDna.isWooDnaFlow() ) {
			return null;
		}
		/* translators: pluginName is the name of the Woo extension that initiated the connection flow */
		const helpButtonLabel = translate( 'Get help setting up %(pluginName)s', {
			args: {
				pluginName: wooDna.getServiceName(),
			},
		} );

		return (
			<LoggedOutFormLinks>
				<LoggedOutFormLinkItem onClick={ this.handleSignOut }>
					{ translate( 'Create a new account or connect as a different user' ) }
				</LoggedOutFormLinkItem>
				<HelpButton label={ helpButtonLabel } url={ wooDna.getServiceHelpUrl() } />
				{ this.renderBackToWpAdminLink() }
			</LoggedOutFormLinks>
		);
	}

	renderBackToWpAdminLink() {
		const { translate } = this.props;
		const { blogname, redirectAfterAuth } = this.props.authQuery;

		if ( ! this.isWaitingForConfirmation() ) {
			return null;
		}
		return (
			<LoggedOutFormLinkItem href={ redirectAfterAuth }>
				<Gridicon size={ 18 } icon="arrow-left" />{ ' ' }
				{
					// translators: eg: Return to The WordPress.com Blog
					translate( 'Return to %(sitename)s', {
						args: { sitename: decodeEntities( blogname ) },
					} )
				}
			</LoggedOutFormLinkItem>
		);
	}

	renderStateAction() {
		const { authorizeSuccess } = this.props.authorizationData;

		if ( this.props.isSiteBlocked ) {
			return null;
		}

		const isLoading =
			this.props.isFetchingAuthorizationSite ||
			this.props.isRequestingSitePurchases ||
			this.isAuthorizing() ||
			this.retryingAuth ||
			authorizeSuccess;

		if ( this.isWooCoreProfiler() ) {
			return (
				<LoggedOutFormFooter className="jetpack-connect__action-disclaimer">
					<Button
						primary
						disabled={ isLoading || this.isAuthorizing() || this.props.hasXmlrpcError }
						onClick={ this.handleSubmit }
					>
						{ isLoading ? <WPSpinner /> : this.getButtonText() }
					</Button>
				</LoggedOutFormFooter>
			);
		}

		if ( isLoading ) {
			return (
				<div className="jetpack-connect__logged-in-form-loading">
					<span>{ this.getButtonText() }</span> <Spinner size={ 20 } duration={ 3000 } />
				</div>
			);
		}

		const { blogname, from } = this.props.authQuery;
		return (
			<LoggedOutFormFooter className="jetpack-connect__action-disclaimer">
				<Disclaimer
					siteName={ decodeEntities( blogname ) }
					companyName={ this.getCompanyName() }
					from={ from }
				/>
				<Button
					primary
					disabled={ this.isAuthorizing() || this.props.hasXmlrpcError }
					onClick={ this.handleSubmit }
				>
					{ this.getButtonText() }
				</Button>
			</LoggedOutFormFooter>
		);
	}

	render() {
		const { translate } = this.props;
		const wooDna = this.getWooDnaConfig();
		const authSiteId = this.props.authQuery.clientId;
		const { authorizeSuccess, isAuthorizing } = this.props.authorizationData;

		if ( this.isWooCoreProfiler() && ( isAuthorizing || authorizeSuccess ) ) {
			return (
				// Wrap the loader in a modal to show it in full screen
				<Modal
					open
					title=""
					overlayClassName="jetpack-connect-woocommerce-loader__modal-overlay"
					className="jetpack-connect-woocommerce-loader__modal"
					shouldCloseOnClickOutside={ false }
					shouldCloseOnEsc={ false }
					isDismissible={ false }
				>
					<WooLoader stages={ [ ConnectingYourAccountStage, OpeningTheDoorsStage ] } />
				</Modal>
			);
		}

		return (
			<MainWrapper
				isWooOnboarding={ this.isWooOnboarding() }
				isWooCoreProfiler={ this.isWooCoreProfiler() }
				isWpcomMigration={ this.isFromMigrationPlugin() }
				isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
				wooDnaConfig={ wooDna }
				pageTitle={
					wooDna.isWooDnaFlow() ? wooDna.getServiceName() + ' — ' + translate( 'Connect' ) : ''
				}
			>
				<div className="jetpack-connect__authorize-form">
					<div className="jetpack-connect__logged-in-form">
						<QuerySiteFeatures siteIds={ [ authSiteId ] } />
						<QuerySitePurchases siteId={ authSiteId } />
						<QueryUserConnection
							siteId={ authSiteId }
							siteIsOnSitesList={ this.props.isAlreadyOnSitesList }
						/>
						<AuthFormHeader
							authQuery={ this.props.authQuery }
							isWooOnboarding={ this.isWooOnboarding() }
							isWooCoreProfiler={ this.isWooCoreProfiler() }
							isWpcomMigration={ this.isFromMigrationPlugin() }
							isFromAutomatticForAgenciesPlugin={ this.isFromAutomatticForAgenciesPlugin() }
							wooDnaConfig={ wooDna }
						/>
						{ this.renderContent() }
						{ this.renderFooterLinks() }
					</div>
				</div>
				<AuthorizationScreenReaderIndicator message={ this.getScreenReaderAuthMessage() } />
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state, { authQuery } ) => {
		// Note: reading from a cookie here rather than redux state,
		// so any change in value will not execute connect().
		const mobileAppRedirect = retrieveMobileRedirect();
		const isMobileAppFlow = !! mobileAppRedirect;
		const selectedPlanSlug = retrievePlan();
		const fromSource = retrieveSource();

		return {
			authAttempts: getAuthAttempts( state, urlToSlug( authQuery.site ) ),
			authorizationData: getAuthorizationData( state ),
			calypsoStartedConnection: isCalypsoStartedConnection( authQuery.site ),
			canManageOptions: canCurrentUser( state, authQuery.clientId, 'manage_options' ),
			hasExpiredSecretError: hasExpiredSecretErrorSelector( state ),
			hasXmlrpcError: hasXmlrpcErrorSelector( state ),
			isAlreadyOnSitesList: isRemoteSiteOnSitesList( state, authQuery.site ),
			isFetchingAuthorizationSite: isRequestingSite( state, authQuery.clientId ),
			isFetchingSites: isRequestingSites( state ),
			isMobileAppFlow,
			isRequestingSitePurchases: isFetchingSitePurchases( state ),
			isSiteBlocked: isSiteBlockedSelector( state ),
			isVip: isVipSite( state, authQuery.clientId ),
			mobileAppRedirect,
			partnerID: getPartnerIdFromQuery( state ),
			partnerSlug: getPartnerSlugFromQuery( state ),
			selectedPlanSlug,
			site: getSite( state, authQuery.clientId ),
			siteHasJetpackPaidProduct: siteHasJetpackProductPurchase( state, authQuery.clientId ),
			siteHasBackups: siteHasFeature( state, authQuery.clientId, WPCOM_FEATURES_BACKUPS ),
			user: getCurrentUser( state ),
			userAlreadyConnected: getUserAlreadyConnected( state ),
			fromSource,
		};
	},
	{
		authorize: authorizeAction,
		recordTracksEvent: recordTracksEventAction,
		redirectToLogout,
		retryAuth: retryAuthAction,
		logoutUser,
	}
);

export default flowRight( connectComponent, localize )( JetpackAuthorize );
