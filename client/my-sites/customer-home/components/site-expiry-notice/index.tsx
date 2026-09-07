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
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const HELP_CENTER_STORE = HelpCenter.register();

/**
 * Calypso's mount for the sitewide plan-expiry banner: the selected site, the
 * Redux analytics action, and the Help Center for the post-grace support
 * route. Rendered by My Home in its notice zone.
 */
export default function SiteExpiryNotice() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const currentUserId = useSelector( getCurrentUserId );
	const dispatch = useDispatch();
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	const locale = i18n.getLocaleSlug() ?? 'en';
	const renewReturnUrl = window.location.pathname + window.location.search;
	const viewOtherPlansUrl = siteSlug ? `/plans/${ siteSlug }` : undefined;

	const state = useSiteExpiryNotice( siteId ?? 0, {
		isDashboardScreen: true,
		// `0` matches no purchase, so an unknown user is shown nothing.
		currentUserId: currentUserId ?? 0,
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
		<div className="customer-home__site-expiry-notice">
			<SiteExpiryNoticeBanner
				siteId={ siteId }
				state={ state }
				locale={ locale }
				surface="calypso-home"
				recordTracksEvent={ record }
				renewReturnUrl={ renewReturnUrl }
				viewOtherPlansUrl={ viewOtherPlansUrl }
				onContactSupport={ openSupport }
			/>
		</div>
	);
}
