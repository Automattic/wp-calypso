import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function useIsThemeShowcaseModernEnabled(): boolean {
	const isLoggedIn = useSelector( isUserLoggedIn );
	return isEnabled( 'themes/showcase-modern' ) && ! isLoggedIn;
}
