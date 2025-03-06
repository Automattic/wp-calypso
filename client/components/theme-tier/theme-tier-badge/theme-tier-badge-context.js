import { createContext, useContext } from 'react';

const ThemeTierBadgeContext = createContext( {
	canGoToCheckout: true,
	showUpgradeBadge: true,
	themeId: '',
	siteId: null,
	siteSlug: null,
} );

export const useThemeTierBadgeContext = () => useContext( ThemeTierBadgeContext );

export function ThemeTierBadgeContextProvider( {
	canGoToCheckout,
	children,
	showUpgradeBadge = true,
	themeId,
	siteId,
	siteSlug,
} ) {
	const value = {
		canGoToCheckout,
		showUpgradeBadge,
		themeId,
		siteId,
		siteSlug,
	};

	return (
		<ThemeTierBadgeContext.Provider value={ value }>{ children }</ThemeTierBadgeContext.Provider>
	);
}

export default ThemeTierBadgeContext;
