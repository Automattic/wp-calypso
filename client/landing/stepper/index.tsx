import '@automattic/calypso-polyfills';
import accessibleFocus from '@automattic/accessible-focus';
import { initializeAnalytics, getGenericSuperPropsGetter } from '@automattic/calypso-analytics';
import { CurrentUser } from '@automattic/calypso-analytics/dist/types/utils/current-user';
import config from '@automattic/calypso-config';
import { User as UserStore } from '@automattic/data-stores';
import { ECOMMERCE_FLOW, ecommerceFlowRecurTypes } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import defaultCalypsoI18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { requestAllBlogsAccess } from 'wpcom-proxy-request';
import { setupErrorLogger } from 'calypso/boot/common';
import { setupLocale } from 'calypso/boot/locale';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
import { retargetFullStory } from 'calypso/lib/analytics/fullstory';
import { addHotJarScript } from 'calypso/lib/analytics/hotjar';
import { createReduxStore } from 'calypso/state';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import { createQueryClient } from 'calypso/state/query-client';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { requestSites } from 'calypso/state/sites/actions';
import { isAnchorFmFlow } from './declarative-flow/anchor-fm-flow';
import { FlowRenderer } from './declarative-flow/internals';
import 'calypso/components/environment-badge/style.scss';
import availableFlows from './declarative-flow/registered-flows';
import { useQuery } from './hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from './stores';
import { setupWpDataDebug } from './utils/devtools';
import { WindowLocaleEffectManager } from './utils/window-locale-effect-manager';
import type { Flow } from './declarative-flow/internals/types';

declare const window: AppWindow;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initializeCalypsoUserStore( reduxStore: any, user: CurrentUser ) {
	config.isEnabled( 'signup/inline-help' ) && reduxStore.dispatch( requestHappychatEligibility() );
	reduxStore.dispatch( setCurrentUser( user ) );
	reduxStore.dispatch( requestSites() );
}

function determineFlow() {
	if ( isAnchorFmFlow() ) {
		return availableFlows[ 'anchor-fm-flow' ];
	}

	const flowNameFromPathName = window.location.pathname.split( '/' )[ 2 ];

	return availableFlows[ flowNameFromPathName ] || availableFlows[ 'site-setup' ];
}

/**
 * TODO: this is no longer a switch and should be removed
 */
const FlowSwitch: React.FC< { user: UserStore.CurrentUser | undefined; flow: Flow } > = ( {
	user,
	flow,
} ) => {
	const { receiveCurrentUser } = useDispatch( USER_STORE );
	const { setEcommerceFlowRecurType } = useDispatch( ONBOARD_STORE );

	const recurType = useQuery().get( 'recur' );

	if ( flow.name === ECOMMERCE_FLOW ) {
		const isValidRecurType =
			recurType && Object.values( ecommerceFlowRecurTypes ).includes( recurType );
		if ( isValidRecurType ) {
			setEcommerceFlowRecurType( recurType );
		} else {
			setEcommerceFlowRecurType( ecommerceFlowRecurTypes.YEARLY );
		}
	}

	user && receiveCurrentUser( user as UserStore.CurrentUser );

	return <FlowRenderer flow={ flow } />;
};
interface AppWindow extends Window {
	BUILD_TARGET?: string;
}

window.AppBoot = async () => {
	// backward support the old Stepper URL structure (?flow=something)
	const flowNameFromQueryParam = new URLSearchParams( window.location.search ).get( 'flow' );
	if ( flowNameFromQueryParam && availableFlows[ flowNameFromQueryParam ] ) {
		window.location.href = `/setup/${ flowNameFromQueryParam }`;
	}

	// put the proxy iframe in "all blog access" mode
	// see https://github.com/Automattic/wp-calypso/pull/60773#discussion_r799208216
	requestAllBlogsAccess();

	setupWpDataDebug();
	addHotJarScript();
	retargetFullStory();

	// Add accessible-focus listener.
	accessibleFocus();

	const user = {
		ID: 115118448,
		display_name: 'alshakero',
		username: 'alshakero',
		avatar_URL: 'https://0.gravatar.com/avatar/6e9586f5263e2b6c5c87ac91c3f9f910?s=96&d=identicon',
		site_count: 523,
		jetpack_site_count: 3,
		visible_site_count: 460,
		jetpack_visible_site_count: 3,
		date: '2017-01-03T17:53:27+00:00',
		has_unseen_notes: false,
		newest_note_type: 'like',
		phone_account: false,
		email: 'omar@omaralshaker.com',
		email_verified: true,
		is_valid_google_apps_country: true,
		user_ip_country_code: 'NL',
		logout_URL: '',
		primary_blog: 181652058,
		primary_blog_is_jetpack: false,
		has_promote_widget: true,
		has_jetpack_partner_access: false,
		primary_blog_url: 'http://punsintended418746564.wordpress.com',
		meta: {
			links: {
				self: 'https://public-api.wordpress.com/rest/v1.1/me',
				help: 'https://public-api.wordpress.com/rest/v1.1/me/help',
				site: 'https://public-api.wordpress.com/rest/v1.1/sites/5836086',
				flags: 'https://public-api.wordpress.com/rest/v1.1/me/flags',
			},
			marketing_price_group: false,
			plans_reorder_abtest_variation: 'control',
			data: {
				flags: {
					active_flags: [
						'publish_post_milestones',
						'reader_blog_header_image',
						'i7_limit_editor_loading',
						'newdash_themes_logged_out',
						'newdash_i14',
						'instapost_safari_iframe_fix',
						'calypso_sites',
						'interim_editor',
						'newdash_store_domain_management',
						'newdash_store_google_apps',
						'masterbar',
						'me_section',
						'calypso_me',
						'notifications2',
						'notifications2_wide',
						'me_billing',
						'calypso_stats',
						'calypso_plans',
						'calypso_checkout',
						'calypso_domain_search',
						'calypso_domain_management',
						'calypso_reader',
						'community_translator',
						'calypso_reader_manage_following',
						'calypso_support_user',
						'calypso_allow_nonprimary_domains_without_plan',
						'subscriber_import',
					],
				},
			},
		},
		social_login_connections: null,
		abtests: {},
		i18n_empathy_mode: false,
		use_fallback_for_incomplete_languages: false,
		primarySiteSlug: 'punsintended418746564.wordpress.com',
		localeSlug: 'en',
		localeVariant: '',
	};
	const userId = user.ID;

	const queryClient = await createQueryClient( userId );

	initializeAnalytics( user, getGenericSuperPropsGetter( config ) );

	const initialState = getInitialState( initialReducer, userId );
	const reduxStore = createReduxStore( initialState, initialReducer );
	setStore( reduxStore, getStateFromCache( userId ) );
	setupLocale( user, reduxStore );

	user && initializeCalypsoUserStore( reduxStore, user as CurrentUser );

	setupErrorLogger( reduxStore );

	const flowLoader = determineFlow();
	const { default: flow } = await flowLoader();

	ReactDom.render(
		<CalypsoI18nProvider i18n={ defaultCalypsoI18n }>
			<Provider store={ reduxStore }>
				<QueryClientProvider client={ queryClient }>
					<WindowLocaleEffectManager />
					<BrowserRouter basename="setup">
						<FlowSwitch user={ user as UserStore.CurrentUser } flow={ flow } />
						{ config.isEnabled( 'cookie-banner' ) && (
							<AsyncLoad require="calypso/blocks/cookie-banner" placeholder={ null } />
						) }
						<AsyncLoad
							require="calypso/components/global-notices"
							placeholder={ null }
							id="notices"
						/>
					</BrowserRouter>
					{ config.isEnabled( 'signup/inline-help' ) && (
						<AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } />
					) }
				</QueryClientProvider>
			</Provider>
		</CalypsoI18nProvider>,
		document.getElementById( 'wpcom' )
	);
};
