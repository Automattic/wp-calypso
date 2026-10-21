import { useSelector } from 'calypso/state';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors';

export function useThemeTierForTheme( themeId: string ) {
	return useSelector( ( state ) => getThemeTierForTheme( state, themeId ) );
}
