import Theme from './theme';
import { ThemeContextProvider } from './theme-context';

export default function ( props ) {
	const { position, themeId, ...restProps } = props;

	return (
		<ThemeContextProvider position={ position } themeId={ themeId }>
			<Theme { ...restProps } />
		</ThemeContextProvider>
	);
}
