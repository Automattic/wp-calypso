import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export default function useIsFSEActive() {
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { data } = useActiveThemeQuery( siteId, isLoggedIn );
	const isFSEActive = data?.[ 0 ]?.is_block_theme ?? false;

	return isFSEActive;
}
