import { siteByIdQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { usePostTransferPluginRecovery } from './use-post-transfer-plugin-recovery';

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
	isTransferredUpload,
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
	isTransferredUpload: boolean;
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
	const pluginsUrlFresh = freshAdminUrl
		? `${ freshAdminUrl }plugins.php?activate=true&plugin_status=active`
		: null;

	const pluginsUrlSelector = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' )
	);

	// Prefer fresh URL when available; if in atomic flow, wait for fresh URL
	const pluginsUrlFinal = atomicFlow ? pluginsUrlFresh : pluginsUrlFresh || pluginsUrlSelector;

	// A plugin install that has landed on an Atomic site with the plugin possibly still inactive.
	// Covers both the checkout-initiated flow (atomicFlow never set) and the flow where this component
	// drives the transfer (atomicFlow set) — in both, the transfer can complete before the plugin is
	// activated. It does NOT gate on wporgPlugin.wporg: wordpress.org answers 200 with an empty body
	// for a marketplace-only slug, which the store normalizes to wporg: true, so that never holds.
	const isRecoveryFlow = ! isPluginUploadFlow && !! pluginSlug && !! freshSite?.is_wpcom_atomic;

	// A zip upload's transfer installs the archive and can report complete before activating it. Until
	// the plugin list is read again the plugin cannot be seen at all: it was last fetched while the
	// site was still Simple.
	const uploadTransferSettled =
		isTransferredUpload &&
		automatedTransferStatus === transferStates.COMPLETE &&
		!! isAtomicTransferReady;

	usePostTransferPluginRecovery( {
		siteId,
		enabled: ( isRecoveryFlow || uploadTransferSettled ) && ! pluginActive,
		// isAtomicTransferReady already requires manage_options, which the transfer propagates after
		// is_wpcom_atomic flips; activating during that gap would fail and burn the retry budget.
		canActivate: !! isAtomicTransferReady,
		// Two recovery windows: the checkout-initiated flow, which sits at step 0 while it observes a
		// background transfer, and the component-driven transfer, whose plugin lands at step 2 after the
		// step-driven effect's activation window (step 1). A transferred upload's plugin is this hook's
		// outright, since it needs retrying and the step-driven effect stands down for that flow.
		// Leaving ordinary in-place installs to that effect avoids a redundant activation at step 2.
		ownsActivation:
			uploadTransferSettled ||
			( ! atomicFlow && currentStep === 0 ) ||
			( atomicFlow && currentStep === 2 ),
		installedPluginSlug: installedPlugin?.slug,
	} );
	// Every plugin flow lands here the same way: the plugin reads active. For the ones a transfer
	// drives, that is only true once the transfer is far enough along and the site is reachable, which
	// is also when the URL below resolves.
	useEffect( () => {
		if ( installedPlugin && pluginActive && pluginsUrlFinal ) {
			window.location.href = pluginsUrlFinal;
		}
	}, [ installedPlugin, pluginActive, pluginsUrlFinal ] );

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
