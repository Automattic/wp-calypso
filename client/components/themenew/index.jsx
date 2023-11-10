import Theme from './theme';
import { ThemeContextProvider } from './theme-context';

import '../theme/style.scss';

export default function ( { isPlaceholder = false, themeId = '', themePosition = 0 } ) {
	return (
		<ThemeContextProvider themeId={ themeId } themePosition={ themePosition }>
			<Theme isPlaceholder={ isPlaceholder } />
		</ThemeContextProvider>
	);
}
