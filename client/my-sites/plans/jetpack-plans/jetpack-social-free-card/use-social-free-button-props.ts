import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';

type SiteId = number | null;

interface Props {
	primary: boolean;
	href: string;
	label: TranslateResult;
	onClick: React.MouseEventHandler;
}

const JETPACK_SOCIAL_PAGE = 'https://jetpack.com/social/';
const CALYPSO_SOCIAL_LANDING_PAGE = '/pricing/jetpack-social/welcome';

export default function useSocialFreeButtonProps( siteId: SiteId, isOwned: boolean ): Props {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteWpAdminUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack-social' )
	);

	const primary = ! isOwned;

	const href = useMemo( () => {
		if ( isOwned && siteWpAdminUrl ) {
			return siteWpAdminUrl;
		}
		if ( isJetpackCloud() ) {
			return CALYPSO_SOCIAL_LANDING_PAGE;
		}
		return JETPACK_SOCIAL_PAGE;
	}, [ isOwned, siteWpAdminUrl ] );

	const label = isOwned ? translate( 'Manage plugin' ) : translate( 'Get Social' );

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_product_jpsocial_free_click', {
				site_id: siteId ?? undefined,
				is_owned: !! isOwned,
			} )
		);
	}, [ dispatch, siteId, isOwned ] );

	return {
		primary,
		href,
		label,
		onClick,
	};
}
