import Theme from './theme';
import { ThemeContextProvider } from './theme-context';

import '../theme/style.scss';

export default function ( { isPlaceholder, position, themeId } ) {
	return (
		<ThemeContextProvider position={ position } themeId={ themeId }>
			<Theme isPlaceholder={ isPlaceholder } />
		</ThemeContextProvider>
	);
}
