import clsx from 'clsx';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function StatsMain( { children, ...props }: MainProps ) {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const customTheme = useWPAdminTheme( isSiteJetpack );

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme ) }>
			{ children }
		</Main>
	);
}
