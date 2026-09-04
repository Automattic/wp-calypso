import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import i18n from 'i18n-calypso';
import { useCallback } from 'react';
import {
	SiteExpiryNoticeBanner,
	useSiteExpiryNotice,
} from 'calypso/dashboard/components/site-expiry-notice';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * Calypso's mount for the sitewide plan-expiry banner: the selected site, the
 * Redux analytics action, and the Help Center for the post-grace support
 * route. Rendered by the layout at the top of the primary column on every
 * section that has a selected site.
 */
export default function SiteExpiryNotice( { isDashboardScreen }: { isDashboardScreen: boolean } ) {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const locale = i18n.getLocaleSlug() ?? 'en';
	const renewReturnUrl = window.location.pathname + window.location.search;
	const viewOtherPlansUrl = siteSlug ? `/plans/${ siteSlug }` : undefined;

	const state = useSiteExpiryNotice( siteId ?? 0, {
		isDashboardScreen,
		locale,
		renewReturnUrl,
		viewOtherPlansUrl,
	} );

	const record = useCallback(
		( name: string, properties?: Record< string, unknown > ) =>
			dispatch( recordTracksEvent( name, properties ) ),
		[ dispatch ]
	);

	const openSupport = useCallback(
		( message: string ) => {
			setNavigateToRoute(
				addQueryArgs( '/odie', {
					userFieldMessage: message,
					siteId: siteId ? String( siteId ) : undefined,
				} )
			);
			setShowHelpCenter( true );
		},
		[ setNavigateToRoute, setShowHelpCenter, siteId ]
	);

	if ( ! siteId || ! state ) {
		return null;
	}

	return (
		<div className="layout__site-expiry-notice">
			<SiteExpiryNoticeBanner
				siteId={ siteId }
				state={ state }
				locale={ locale }
				surface="calypso-layout"
				recordTracksEvent={ record }
				renewReturnUrl={ renewReturnUrl }
				viewOtherPlansUrl={ viewOtherPlansUrl }
				onContactSupport={ openSupport }
			/>
		</div>
	);
}
