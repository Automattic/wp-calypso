export type MarketplaceThemeProps = { theme?: MarketplaceThemeType };
export type MarketplaceThemeType = {
	weights: {
		bold: string;
		normal: string;
	};
	fontSize: {
		small: string;
	};
};

const theme: MarketplaceThemeType = {
	weights: {
		bold: '600',
		normal: '400',
	},
	fontSize: {
		small: '14px',
	},
};
export default theme;
