import colorStudio from '@automattic/color-studio';
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
		textColorDisabled: string;
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
	borderRadius: {
		small: string;
	};
};

const theme: Theme = {
	colors: {
		background: swatches.gray0,
		surface: swatches.white,
		primary: colorStudio.colors[ 'WordPress Blue 50' ],
		primaryBorder: swatches.pink80,
		primaryOver: colorStudio.colors[ 'WordPress Blue 60' ],
		highlight: colorStudio.colors[ 'WordPress Blue 50' ],
		highlightBorder: colorStudio.colors[ 'WordPress Blue 80' ],
		highlightOver: colorStudio.colors[ 'WordPress Blue 60' ],
		success: colorStudio.colors[ 'Green 30' ],
		discount: colorStudio.colors[ 'Green 60' ],
		disabledPaymentButtons: colorStudio.colors[ 'Gray 5' ],
		disabledPaymentButtonsAccent: colorStudio.colors[ 'Gray 20' ],
		disabledButtons: colorStudio.colors[ 'White' ],
		borderColor: swatches.gray10,
		borderColorLight: swatches.gray5,
		borderColorDark: swatches.gray50,
		upcomingStepBackground: swatches.gray5,
		textColor: colorStudio.colors[ 'Gray 60' ],
		textColorLight: colorStudio.colors[ 'Gray 50' ],
		textColorDark: colorStudio.colors[ 'Gray 100' ],
		textColorDisabled: colorStudio.colors[ 'Gray 50' ],
		error: swatches.red50,
		warningBackground: swatches.red0,
		outline: colorStudio.colors[ 'WordPress Blue 30' ],
		applePayButtonColor: swatches.black,
		applePayButtonRollOverColor: swatches.gray80,
		noticeBackground: swatches.gray80,
		defaultNoticeIconBackground: swatches.gray30,
		textColorOnDarkBackground: swatches.white,
		paypalGold: '#F0C443',
		paypalGoldHover: '#FFB900',
		modalBackground: 'rgba( 255,255,255,0.9 )',
		disabledField: colorStudio.colors[ 'Gray 0' ],
		placeHolderTextColor: swatches.gray30,
	},
	breakpoints: {
		desktopUp: 'min-width: 960px',
		tabletUp: 'min-width: 700px',
		bigPhoneUp: 'min-width: 480px',
		smallPhoneUp: 'min-width: 400px',
	},
	weights: {
		bold: '500',
		normal: '400',
	},
	fonts: {
		body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
	},
	fontSize: {
		small: '14px',
	},
	borderRadius: {
		small: '2px',
	},
};

export default theme;
