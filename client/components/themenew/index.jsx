import Theme from './theme';
import { ThemeContextProvider } from './theme-context';

import '../theme/style.scss';

export default function ( { isPlaceholder = false, position = 0, themeId = '' } ) {
	return (
		<ThemeContextProvider position={ position } themeId={ themeId }>
			<Theme isPlaceholder={ isPlaceholder } />
		</ThemeContextProvider>
	);
}
