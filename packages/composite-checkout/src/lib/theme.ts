/**
 * Internal dependencies
 */
import { swatches } from './swatches';

export type Theme = {
	colors: {
		background: string;
		surface: string;
		primary: string;
		primaryBorder: string;
		primaryOver: string;
		highlight: string;
		highlightBorder: string;
		highlightOver: string;
		success: string;
		discount: string;
		disabledPaymentButtons: string;
		disabledPaymentButtonsAccent: string;
		disabledButtons: string;
		borderColor: string;
		borderColorLight: string;
		borderColorDark: string;
		upcomingStepBackground: string;
		textColor: string;
		textColorLight: string;
		textColorDark: string;
		error: string;
		warningBackground: string;
		outline: string;
		applePayButtonColor: string;
		applePayButtonRollOverColor: string;
		noticeBackground: string;
		defaultNoticeIconBackground: string;
		textColorOnDarkBackground: string;
		paypalGold: string;
		paypalGoldHover: string;
		modalBackground: string;
		disabledField: string;
		placeHolderTextColor: string;
	};
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

const theme: Theme = {
	colors: {
		background: swatches.gray0,
		surface: swatches.white,
		primary: swatches.pink50,
		primaryBorder: swatches.pink80,
		primaryOver: swatches.pink60,
		highlight: swatches.wordpressBlue50,
		highlightBorder: swatches.wordpressBlue80,
		highlightOver: swatches.wordpressBlue60,
		success: swatches.green50,
		discount: swatches.green50,
		disabledPaymentButtons: swatches.gray0,
		disabledPaymentButtonsAccent: swatches.gray5,
		disabledButtons: swatches.gray20,
		borderColor: swatches.gray10,
		borderColorLight: swatches.gray5,
		borderColorDark: swatches.gray50,
		upcomingStepBackground: swatches.gray5,
		textColor: swatches.gray80,
		textColorLight: swatches.gray50,
		textColorDark: swatches.black,
		error: swatches.red50,
		warningBackground: swatches.red0,
		outline: swatches.blue30,
		applePayButtonColor: swatches.black,
		applePayButtonRollOverColor: swatches.gray80,
		noticeBackground: swatches.gray80,
		defaultNoticeIconBackground: swatches.gray30,
		textColorOnDarkBackground: swatches.white,
		paypalGold: '#F0C443',
		paypalGoldHover: '#FFB900',
		modalBackground: 'rgba( 255,255,255,0.9 )',
		disabledField: swatches.gray0,
		placeHolderTextColor: swatches.gray30,
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
