import { createContext, useContext } from 'react';

const ThemeTierBadgeContext = createContext( {
	canGoToCheckout: true,
	showUpgradeBadge: true,
	themeId: '',
} );

export const useThemeTierBadgeContext = () => useContext( ThemeTierBadgeContext );

export function ThemeTierBadgeContextProvider( {
	canGoToCheckout,
	children,
	showUpgradeBadge = true,
	themeId,
} ) {
	const value = {
		canGoToCheckout,
		showUpgradeBadge,
		themeId,
	};

	return (
		<ThemeTierBadgeContext.Provider value={ value }>{ children }</ThemeTierBadgeContext.Provider>
	);
}

export default ThemeTierBadgeContext;
