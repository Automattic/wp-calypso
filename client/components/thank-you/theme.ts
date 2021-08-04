export type ThankYouThemeProps = { theme?: ThankYouThemeType };
export type ThankYouThemeType = {
	colors: { textColorLight: string; borderColorLight: string; studioGrey: string };
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
	fontSize: {
		small: string;
	};
};

const theme: ThankYouThemeType = {
	colors: {
		borderColorLight: 'var(--studio-gray-0)',
		textColorLight: 'var(--color-text)',
		studioGrey: 'var(--studio-gray-0)',
	},
	breakpoints: {
		tabletDown: 'max-width: 782px',
	},
	weights: {
		bold: '600',
		normal: '400',
	},
	fontSize: {
		small: '14px',
	},
};
export default theme;
