import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useActiveThemeQuery } from './use-active-theme-query';

const withIsFSEActive = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( getSelectedSiteId );
		const userLoggedIn = useSelector( isUserLoggedIn );
		const { data, isLoading } = useActiveThemeQuery( siteId, userLoggedIn );
		const isFSEActive = data?.[ 0 ]?.is_block_theme ?? false;

		return <Wrapped { ...props } isFSEActiveLoading={ isLoading } isFSEActive={ isFSEActive } />;
	},
	'withIsFSEActive'
);

export default withIsFSEActive;
