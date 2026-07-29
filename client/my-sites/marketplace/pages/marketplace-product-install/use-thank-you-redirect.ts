import { siteByIdQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useInterval } from 'calypso/lib/interval';
import { useSelector, useDispatch } from 'calypso/state';
import { isTransferComplete } from 'calypso/state/automated-transfer/constants';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { usePostTransferPluginRecovery } from './use-post-transfer-plugin-recovery';

const pluginsAdminUrl = ( adminUrl: string | null | undefined, query = '' ) =>
	adminUrl ? `${ adminUrl }plugins.php${ query }` : null;

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
	transferObserved,
	isTransferredUpload,
	uploadFailed,
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
	transferObserved: boolean;
	isTransferredUpload: boolean;
	uploadFailed: boolean;
} ) {
	const dispatch = useDispatch();

	// Fetch fresh site data (including admin_url) post-transfer
	const { data: freshSite } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId && ( ! atomicFlow || isTransferComplete( automatedTransferStatus ) ),
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

	// A plugin install that has landed on an Atomic site with the plugin possibly still inactive.
	// Covers both the checkout-initiated flow (atomicFlow never set) and the flow where this component
	// drives the transfer (atomicFlow set) — in both, the transfer can complete before the plugin is
	// activated. It does NOT gate on wporgPlugin.wporg: wordpress.org answers 200 with an empty body
	// for a marketplace-only slug, which the store normalizes to wporg: true, so that never holds.
	const isRecoveryFlow = ! isPluginUploadFlow && !! pluginSlug && !! freshSite?.is_wpcom_atomic;

	// A rejected archive can still be transferring behind its error screen, since the endpoint creates
	// the transfer before validating the archive. Nothing about a failed attempt should navigate.
	const uploadAttemptFailed = isPluginUploadFlow && uploadFailed;

	const pluginConfirmedActive = !! ( installedPlugin && pluginActive ) && ! uploadAttemptFailed;

	// The upload's transfer is over and the site is reachable.
	const uploadTransferSettled = !! (
		isTransferredUpload &&
		! uploadAttemptFailed &&
		transferObserved &&
		isTransferComplete( automatedTransferStatus ) &&
		isAtomicTransferReady
	);

	const recoveryStatus = usePostTransferPluginRecovery( {
		siteId,
		enabled: ( isRecoveryFlow || uploadTransferSettled ) && ! pluginActive,
		runImmediately: uploadTransferSettled,
		// isAtomicTransferReady already requires manage_options, which the transfer propagates after
		// is_wpcom_atomic flips; activating during that gap would fail and burn the retry budget.
		canActivate: !! isAtomicTransferReady,
		// A transferred upload's plugin is this hook's; the other flows hand theirs over at the step
		// shown, and activating outside those windows would race the owner that has it.
		ownsActivation:
			uploadTransferSettled ||
			( ! atomicFlow && currentStep === 0 ) ||
			( atomicFlow && currentStep === 2 ),
		installedPlugin,
	} );

	// The transfer being over says nothing about the archive: it reports complete whether the install
	// worked, failed, or was skipped. Only the search for the plugin itself can settle that.
	const uploadInstallUnconfirmed = uploadTransferSettled && recoveryStatus === 'exhausted';

	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		// Every flow lands here the same way: the plugin reads active. That covers an in-place install,
		// an upload, and both atomic-transfer flows, whose plugin only reads active once the transfer is
		// far enough along.
		if ( pluginConfirmedActive && activatedPluginsUrl ) {
			window.location.href = activatedPluginsUrl;
			return;
		}

		// An upload with no plugin to show for it: the list claims nothing, the activated view would.
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
