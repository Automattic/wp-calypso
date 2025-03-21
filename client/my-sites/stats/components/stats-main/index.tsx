import config from '@automattic/calypso-config';
import clsx from 'clsx';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import StatsUpsellModal from 'calypso/my-sites/stats/stats-upsell-modal';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getUpsellModalView } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function StatsMain( { children, className, ...props }: MainProps ) {
	const isWPAdminAndNotSimpleSite = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) as number;
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const customTheme = useWPAdminTheme( isSiteJetpack );

	// Make the upsell modal view available on all Stats pages.
	const upsellModalView = useSelector( ( state ) => getUpsellModalView( state, siteId ) );

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme, className ) }>
			{ ! isWPAdminAndNotSimpleSite && <QuerySiteFeatures siteIds={ [ siteId ] } /> }
			{ children }
			{ upsellModalView && <StatsUpsellModal siteId={ siteId } /> }
		</Main>
	);
}
