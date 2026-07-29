import { siteByIdQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { transferEndStates, transferStates } from 'calypso/state/automated-transfer/constants';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { useDelayedCondition } from './use-delayed-condition';
import {
	PLUGIN_POLL_INTERVAL_MS,
	usePostTransferPluginRecovery,
} from './use-post-transfer-plugin-recovery';

// How long the plugin list gets to turn up the uploaded plugin. Long enough that a poll started
// just inside the window, and any activation its result triggers, still lands in time.
const INSTALL_CONFIRMATION_GRACE_PERIOD_MS = PLUGIN_POLL_INTERVAL_MS * 5;

const pluginsAdminUrl = ( adminUrl: string | null | undefined, query = '' ) =>
	adminUrl ? `${ adminUrl }plugins.php${ query }` : null;

// Every phase that isn't an end state means a transfer is under way — including uploading and the
// switcheroo, which this page can well be mounted during.
const isTransferRunning = ( status: string | null ) =>
	!! status &&
	status !== transferStates.INQUIRING &&
	! ( transferEndStates as readonly ( string | null )[] ).includes( status );

// The redirect machinery: once a flow completes it fetches the freshest site data, resolves the
// destination URL, keeps polling where a flow finishes in the background, and navigates. Plugin and
// upload flows land on wp-admin's plugins page; a theme flow goes to the marketplace thank-you page.
export function useThankYouRedirect( {
	siteId,
	selectedSiteSlug,
	currentStep,
	isPluginUploadFlow,
	pluginSlug,
	themeSlug,
	wpOrgTheme,
	isThemeActive,
	installedPlugin,
	pluginActive,
	atomicFlow,
	automatedTransferStatus,
}: {
	siteId: number;
	selectedSiteSlug: string | null;
	currentStep: number;
	isPluginUploadFlow: boolean;
	pluginSlug: string;
	themeSlug: string;
	wpOrgTheme: { id?: string } | null | undefined;
	isThemeActive: boolean;
	installedPlugin: { slug?: string; id?: string } | null | undefined;
	pluginActive: boolean;
	atomicFlow: boolean;
	automatedTransferStatus: string | null;
} ) {
	const dispatch = useDispatch();

	// Fetch fresh site data (including admin_url) post-transfer
	const { data: freshSite } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId && ( ! atomicFlow || automatedTransferStatus === transferStates.COMPLETE ),
		refetchInterval: ( query ) =>
			query.state.data && isAtomicTransferredSite( query.state.data ) ? false : 2000,
		staleTime: 0,
		refetchOnMount: 'always',
	} );

	const freshAdminUrl = freshSite?.options?.admin_url;
	const isAtomicTransferReady = freshSite ? isAtomicTransferredSite( freshSite ) : false;

	const adminUrlSelector = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	// Prefer fresh URL when available; if in atomic flow, wait for fresh URL
	const adminUrl = atomicFlow ? freshAdminUrl : freshAdminUrl || adminUrlSelector;

	// The activated view announces a result; the plain list claims nothing.
	const activatedPluginsUrl = pluginsAdminUrl( adminUrl, '?activate=true&plugin_status=active' );
	const pluginsUrl = pluginsAdminUrl( adminUrl );

	// Remember that a transfer ran during this flow: a completed status on its own can be left over
	// from an earlier transfer, and an upload to an already-Atomic site never transfers at all.
	const transferObservedRef = useRef( false );
	if ( isTransferRunning( automatedTransferStatus ) ) {
		transferObservedRef.current = true;
	}
	const transferObserved = transferObservedRef.current;

	// A plugin install that has landed on an Atomic site with the plugin possibly still inactive.
	// Covers both the checkout-initiated flow (atomicFlow never set) and the flow where this component
	// drives the transfer (atomicFlow set) — in both, the transfer can complete before the plugin is
	// activated. It does NOT gate on wporgPlugin.wporg: wordpress.org answers 200 with an empty body
	// for a marketplace-only slug, which the store normalizes to wporg: true, so that never holds.
	const isRecoveryFlow = ! isPluginUploadFlow && !! pluginSlug && !! freshSite?.is_wpcom_atomic;

	const pluginConfirmedActive = !! ( installedPlugin && pluginActive );

	// The upload's transfer is over and the site is reachable. This is not evidence the archive
	// installed: the transfer reports complete whether the install succeeded, failed, or was skipped.
	const uploadTransferSettled = !! (
		isPluginUploadFlow &&
		transferObserved &&
		transferStates.COMPLETE === automatedTransferStatus &&
		isAtomicTransferReady
	);

	// Which is why the plugin list, polled below, gets a window to show the plugin before we conclude
	// it never will.
	const uploadInstallUnconfirmed = useDelayedCondition(
		uploadTransferSettled && ! pluginConfirmedActive,
		INSTALL_CONFIRMATION_GRACE_PERIOD_MS
	);

	usePostTransferPluginRecovery( {
		siteId,
		enabled: ( isRecoveryFlow || uploadTransferSettled ) && ! pluginActive,
		// isAtomicTransferReady already requires manage_options, which the transfer propagates after
		// is_wpcom_atomic flips; activating during that gap would fail and burn the retry budget.
		canActivate: !! isAtomicTransferReady,
		// Two recovery windows: the checkout-initiated flow, which sits at step 0 while it observes a
		// background transfer, and the component-driven transfer, whose plugin lands at step 2 after the
		// step-driven effect's activation window (step 1). Leaving ordinary in-place installs to that
		// effect avoids a redundant activation racing it at step 2.
		ownsActivation: ( ! atomicFlow && currentStep === 0 ) || ( atomicFlow && currentStep === 2 ),
		installedPlugin,
	} );
	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		// Happens in 3 cases:
		// - Click on "Install and activate" button for any plugin on /plugins/<site_name>
		// - Install with the help of uploading archive of a plugins
		// - If it's simple site which doesn't support plugins, then installing and activation happens at the same time with upgrading to Business plan
		// This also covers the atomic-transfer flows (checkout-initiated and component-driven): the
		// plugin only reads active once the transfer is far enough along, and for an atomicFlow the
		// redirect URL below resolves only after the transfer completes, so no separate arm is needed.
		if ( pluginConfirmedActive && activatedPluginsUrl ) {
			window.location.href = activatedPluginsUrl;
			return;
		}

		// An upload that finished transferring without the plugin ever appearing: land on the list
		// rather than the activated view, which would announce a plugin that may not be there.
		if ( uploadInstallUnconfirmed && pluginsUrl ) {
			window.location.href = pluginsUrl;
		}
	}, [ pluginConfirmedActive, uploadInstallUnconfirmed, activatedPluginsUrl, pluginsUrl ] );

	// Validate theme is already active
	useEffect( () => {
		if ( themeSlug && wpOrgTheme && isThemeActive ) {
			page.redirect(
				`/marketplace/thank-you/${ selectedSiteSlug }?themes=${ themeSlug }&hide-progress-bar`
			);
		}
	}, [ themeSlug, wpOrgTheme, isThemeActive, selectedSiteSlug ] );

	// Polling for theme activation status
	useInterval(
		() => {
			dispatch( requestActiveTheme( siteId ) );
		},
		! themeSlug || currentStep === 0 || ( themeSlug && wpOrgTheme && isThemeActive ) ? null : 3000
	);
}
