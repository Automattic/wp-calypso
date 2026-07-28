import { siteByIdQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useInterval } from 'calypso/lib/interval';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useSelector, useDispatch } from 'calypso/state';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { usePostTransferPluginRecovery } from './use-post-transfer-plugin-recovery';

// The redirect machinery: once a flow completes it fetches the freshest site data, resolves the
// destination URL, keeps polling where a flow finishes in the background, and navigates. Plugin and
// upload flows land on wp-admin's plugins page; a theme flow goes to the marketplace thank-you page.
export function useThankYouRedirect( {
	siteId,
	selectedSite,
	selectedSiteSlug,
	currentStep,
	isPluginUploadFlow,
	pluginSlug,
	themeSlug,
	wpOrgTheme,
	isThemeActive,
	installedPlugin,
	pluginActive,
	uploadedPluginSlug,
	atomicFlow,
	isAtomic,
	automatedTransferStatus,
}: {
	siteId: number;
	selectedSite: { ID?: number } | null | undefined;
	selectedSiteSlug: string | null;
	currentStep: number;
	isPluginUploadFlow: boolean;
	pluginSlug: string;
	themeSlug: string;
	wpOrgTheme: { id?: string } | null | undefined;
	isThemeActive: boolean;
	installedPlugin: { slug?: string; id?: string } | null | undefined;
	pluginActive: boolean;
	uploadedPluginSlug: string;
	atomicFlow: boolean;
	isAtomic: boolean | null;
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
	const pluginsUrlFresh = freshAdminUrl
		? `${ freshAdminUrl }plugins.php?activate=true&plugin_status=active`
		: null;

	const pluginsUrlSelector = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' )
	);

	// Prefer fresh URL when available; if in atomic flow, wait for fresh URL
	const pluginsUrlFinal = atomicFlow ? pluginsUrlFresh : pluginsUrlFresh || pluginsUrlSelector;

	const canManagePlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS )
	);

	// A plugin install that has landed on an Atomic site with the plugin possibly still inactive.
	// Covers both the checkout-initiated flow (atomicFlow never set) and the flow where this component
	// drives the transfer (atomicFlow set) — in both, the transfer can complete before the plugin is
	// activated. It does NOT gate on wporgPlugin.wporg: wordpress.org answers 200 with an empty body
	// for a marketplace-only slug, which the store normalizes to wporg: true, so that never holds.
	const isRecoveryFlow = ! isPluginUploadFlow && !! pluginSlug && !! freshSite?.is_wpcom_atomic;

	usePostTransferPluginRecovery( {
		siteId,
		enabled: isRecoveryFlow && ! pluginActive,
		// isAtomicTransferReady already requires manage_options, which the transfer propagates after
		// is_wpcom_atomic flips; activating during that gap would fail and burn the retry budget.
		canActivate: !! isAtomicTransferReady,
		// The step-driven effect only activates at currentStep 1, so this hook owns activation at every
		// other step — including step 2 of the atomic-transfer flow, where the plugin lands after that
		// effect's window and would otherwise never be activated.
		ownsActivation: currentStep !== 1,
		installedPlugin,
	} );
	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		if (
			// Happens in 3 cases:
			// - Click on "Install and activate" button for any plugin on /plugins/<site_name>
			// - Install with the help of uploading archive of a plugins
			// - If it's simple site which doesn't support plugins, then installing and activation happens at the same time with upgrading to Business plan
			( installedPlugin && pluginActive ) ||
			// Transfer to atomic using a marketplace plugin — wait for the plugin to actually be active,
			// not just for the transfer to complete, or we redirect with the plugin still inactive.
			( atomicFlow &&
				pluginActive &&
				transferStates.COMPLETE === automatedTransferStatus &&
				canManagePlugins &&
				isAtomicTransferReady ) ||
			// Transfer to atomic uploading a zip plugin
			( uploadedPluginSlug &&
				isPluginUploadFlow &&
				! isAtomic &&
				transferStates.COMPLETE === automatedTransferStatus &&
				canManagePlugins &&
				isAtomicTransferReady )
		) {
			// Require a resolved pluginsUrlFinal before redirecting
			if ( ! pluginsUrlFinal ) {
				return;
			}
			waitFor( 1 ).then( () => {
				window.location.href = pluginsUrlFinal as string;
			} );
		}
	}, [
		pluginActive,
		automatedTransferStatus,
		atomicFlow,
		isPluginUploadFlow,
		isAtomic,
		canManagePlugins,
		installedPlugin,
		uploadedPluginSlug,
		pluginsUrlFinal,
		isAtomicTransferReady,
	] ); // We need to trigger this hook also when `automatedTransferStatus` changes cause the plugin install is done on the background in that case.

	// Validate theme is already active
	useEffect( () => {
		if ( themeSlug && wpOrgTheme && isThemeActive ) {
			waitFor( 1 ).then( () =>
				page.redirect(
					`/marketplace/thank-you/${ selectedSiteSlug }?themes=${ themeSlug }&hide-progress-bar`
				)
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
