import { createContext, useContext } from 'react';

const ThemeTierBadgeContext = createContext( {
	canGoToCheckout: true,
	themeId: '',
} );

export const useThemeTierBadgeContext = () => useContext( ThemeTierBadgeContext );

export function ThemeTierBadgeContextProvider( { canGoToCheckout, children, themeId } ) {
	const value = {
		canGoToCheckout,
		themeId,
	};

	return (
		<ThemeTierBadgeContext.Provider value={ value }>{ children }</ThemeTierBadgeContext.Provider>
	);
}

export default ThemeTierBadgeContext;
