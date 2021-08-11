export type ThankYouThemeProps = { theme?: ThankYouThemeType };
export type ThankYouThemeType = {
	colors: {
		backgroundColorHeader: string;
		textHeaderColor: string;
	};
	weights: {
		bold: string;
		normal: string;
	};
};

const theme: ThankYouThemeType = {
	colors: {
		backgroundColorHeader: '#0675C4',
		textHeaderColor: 'white',
	},
	weights: {
		bold: '600',
		normal: '400',
	},
};
export default theme;
