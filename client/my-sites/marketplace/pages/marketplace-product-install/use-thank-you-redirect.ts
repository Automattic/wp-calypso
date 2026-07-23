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
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { requestActiveTheme } from 'calypso/state/themes/actions';

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
	wporgPlugin,
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
	wporgPlugin: { wporg?: boolean } | null | undefined;
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

	// For marketplace plugins (e.g. sensei-pro), the atomic transfer + plugin install
	// is initiated during checkout, not by this component. The wporg data is unavailable,
	// so atomicFlow is never set. Once the site is atomic, poll for installed plugins
	// so that the existing redirect (installedPlugin && pluginActive) fires.
	const isMarketplacePluginFlow =
		! atomicFlow &&
		! isPluginUploadFlow &&
		!! pluginSlug &&
		!! freshSite?.is_wpcom_atomic &&
		wporgPlugin?.wporg === false;

	useInterval(
		() => dispatch( fetchSitePlugins( siteId ) ),
		isMarketplacePluginFlow && ! pluginActive ? 3000 : null
	);

	const canManagePlugins = useSelector( ( state ) => {
		return siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS );
	} );
	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		if (
			// Happens in 3 cases:
			// - Click on "Install and activate" button for any plugin on /plugins/<site_name>
			// - Install with the help of uploading archive of a plugins
			// - If it's simple site which doesn't support plugins, then installing and activation happens at the same time with upgrading to Business plan
			( installedPlugin && pluginActive ) ||
			// Transfer to atomic using a marketplace plugin
			( atomicFlow &&
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
