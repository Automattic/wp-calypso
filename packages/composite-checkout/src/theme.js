/**
 * Internal dependencies
 */
import { swatches } from './lib/swatches.js';

const theme = {
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
		borderColor: swatches.gray20,
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
