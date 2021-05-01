export type MarketplaceThemeType = {
	colors: { textColorLight: string; borderColorLight: string };
	breakpoints: {
		desktopUp?: string;
		tabletUp?: string;
		bigPhoneUp?: string;
		smallPhoneUp?: string;
		tabletDown: string;
	};
	weights: {
		bold: string;
		normal: string;
	};
	fonts: {
		body: string;
	};
	fontSize: {
		small: string;
	};
};

const theme: MarketplaceThemeType = {
	colors: {
		borderColorLight: 'var(--studio-gray-0)',
		textColorLight: 'var(--color-text)',
	},
	breakpoints: {
		tabletDown: 'max-width: 782px',
	},
	weights: {
		bold: '600',
		normal: '400',
	},
	fonts: {
		body:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
	},
	fontSize: {
		small: '14px',
	},
};
export default theme;
