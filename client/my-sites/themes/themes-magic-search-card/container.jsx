/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemesSearchCard from './index';

const ThemesMagicSearchCardContainer = ( {
	search,
	tier,
	showTierThemesControl,
	select,
	onSearch,
} ) => {
	return (
		<div className="themes-magic-search-card__container">
			<ThemesSearchCard
				onSearch={ onSearch }
				search={ search }
				tier={ tier }
				showTierThemesControl={ showTierThemesControl }
				select={ select }
			/>
			<div className="themes-magic-search-card__side-1">Side Div 1</div>
			<div className="themes-magic-search-card__side-2">Side Div 2</div>
		</div>
	);
};
export default ThemesMagicSearchCardContainer;
