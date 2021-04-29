export type MarketplaceThemeType = {
	colors: { textColorLight: string; borderColorLight: string };
	breakpoints: {
		desktopUp: string;
		tabletUp: string;
		bigPhoneUp: string;
		smallPhoneUp: string;
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
		desktopUp: 'min-width: 960px',
		tabletUp: 'min-width: 700px',
		bigPhoneUp: 'min-width: 480px',
		smallPhoneUp: 'min-width: 400px',
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
