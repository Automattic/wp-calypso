import clsx from 'clsx';
import Main, { MainProps } from 'calypso/components/main';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function StatsMain( { children, ...props }: MainProps ) {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const customTheme = useWPAdminTheme( siteId );

	return (
		<Main { ...props } className={ clsx( 'stats-main', 'color-scheme', customTheme ) }>
			{ children }
		</Main>
	);
}
