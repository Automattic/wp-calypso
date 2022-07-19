import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useActiveThemeQuery } from './use-active-theme-query';

const withActiveTheme = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const userLoggedIn = useSelector( isUserLoggedIn );
		const { data, isLoading } = useActiveThemeQuery( siteId, userLoggedIn );

		return <Wrapped { ...props } activeThemeData={ data } isActiveThemeDataLoading={ isLoading } />;
	},
	'withActiveTheme'
);

export default withActiveTheme;
