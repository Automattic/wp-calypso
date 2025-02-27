import colorStudio from '@automattic/color-studio';

import './push-notification-illustration.scss';

/**
 * Module constants
 */
const PALETTE = colorStudio.colors;

const COLOR_GREEN_40 = PALETTE[ 'Jetpack Green 40' ];

const COLOR_GRAY_5 = PALETTE[ 'Gray 5' ];
const COLOR_GRAY_20 = PALETTE[ 'Gray 20' ];
const COLOR_GRAY_80 = PALETTE[ 'Gray 80' ];

const COLOR_WHITE = PALETTE[ 'White' ]; // eslint-disable-line dot-notation

function DeviceSvg() {
	return (
		<svg className="two-factor-authentication__illustration-device">
			<g fill="none" fillRule="evenodd">
				<path
					d="M76.405 0h199.19c19.613 0 26.725 2.042 33.896 5.877 7.17 3.835 12.797 9.462 16.632 16.632C329.958 29.68 332 36.792 332 56.405V179H20V56.405c0-19.613 2.042-26.725 5.877-33.896 3.835-7.17 9.462-12.797 16.632-16.632C49.68 2.042 56.792 0 76.405 0z"
					fill={ COLOR_GRAY_80 }
				/>
				<path
					d="M312 177.497c13.197.117 26.393.27 39.59.472.229.004.41.244.41.537 0 .288-.187.52-.41.524-58.565.901-117.13.81-175.694.97l-87.846-.168c-29.282-.183-58.564-.337-87.847-1.068-.114-.002-.203-.123-.203-.27 0-.143.093-.257.203-.26 13.266-.33 26.532-.543 39.797-.694V65.128c0-1.783.186-2.43.534-3.082a3.635 3.635 0 0 1 1.512-1.512c.652-.348 1.299-.534 3.082-.534h261.744c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v112.37z"
					fill={ COLOR_GRAY_20 }
				/>
				<path
					d="M273.778 68.707l-5.872 5.872c-.315.315-.462.396-.639.45a.909.909 0 0 1-.534 0c-.177-.054-.324-.135-.64-.45l-5.871-5.872a1 1 0 0 1 .707-1.707h12.142a1 1 0 0 1 .707 1.707zM294.282 67h6.436c.446 0 .607.046.77.134.163.087.291.215.378.378.088.163.134.324.134.77v7.436c0 .446-.046.607-.134.77a.909.909 0 0 1-.378.378c-.163.088-.324.134-.77.134h-6.436c-.446 0-.607-.046-.77-.134a.909.909 0 0 1-.378-.378c-.088-.163-.134-.324-.134-.77v-7.436c0-.446.046-.607.134-.77a.909.909 0 0 1 .378-.378c.163-.088.324-.134.77-.134zm-8.282.414v8.304c0 .446-.046.607-.134.77a.909.909 0 0 1-.378.378c-.163.088-.324.134-.77.134h-8.304a1 1 0 0 1-.707-1.707l8.586-8.586a1 1 0 0 1 1.707.707zm-88.198-35.982c-3.605.737-7.216 1.037-10.829 1.215l-5.418.223-5.421.115c-3.615.028-7.229.015-10.845-.022-3.616-.058-7.233-.187-10.853-.577-.267-.028-.46-.282-.434-.569a.505.505 0 0 1 .418-.463c3.61-.505 7.22-.75 10.833-.923 3.612-.155 7.226-.284 10.84-.37l5.42-.061 5.424.049c3.616.062 7.235.245 10.858.867.132.023.223.157.202.3a.256.256 0 0 1-.195.216z"
					fill={ COLOR_WHITE }
				/>
			</g>
		</svg>
	);
}

function NotificationSvg() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 310 80"
			className="two-factor-authentication__illustration-notification"
		>
			<g filter="url(#push-notification-illustration-a)">
				<rect width="300" height="70" x="5" y="3" fill={ COLOR_WHITE } rx="6" />
				<rect width="50" height="50" x="15" y="13" fill={ COLOR_GREEN_40 } rx="14" />
				<path
					fill={ COLOR_WHITE }
					d="M40 19.667c-10.1 0-18.334 8.21-18.334 18.333 0 10.123 8.21 18.334 18.333 18.334 10.123 0 18.334-8.211 18.334-18.334 0-10.122-8.211-18.333-18.334-18.333Zm-.945 21.37h-9.133l9.133-17.77v17.77Zm1.867 11.652V34.92h9.11l-9.11 17.77Z"
				/>
				<rect width="200" height="12" x="75" y="24" fill={ COLOR_GRAY_5 } rx="4" />
				<rect width="170" height="12" x="75" y="41" fill={ COLOR_GRAY_5 } rx="4" />
			</g>
			<defs>
				<filter
					id="push-notification-illustration-a"
					width="310"
					height="80"
					x="0"
					y="0"
					color-interpolation-filters="sRGB"
					filterUnits="userSpaceOnUse"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						result="hardAlpha"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					/>
					<feOffset dy="2" />
					<feGaussianBlur stdDeviation="2.5" />
					<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
					<feBlend in2="BackgroundImageFix" result="effect1_dropShadow_7207_19701" />
					<feBlend in="SourceGraphic" in2="effect1_dropShadow_7207_19701" result="shape" />
				</filter>
			</defs>
		</svg>
	);
}

export default function PushNotificationIllustration() {
	// Inlining two stacked SVGs because they’re a part of an animated image.
	// By not loading them externally, we’re making sure the animation will
	// get fired right away with all of its elements in place.
	const now = new Date();
	const time = `${ now.getHours() % 12 || 12 }:${ String( now.getMinutes() ).padStart( 2, '0' ) }`;

	return (
		<div className="two-factor-authentication__illustration" aria-hidden="true">
			<DeviceSvg />
			<div className="two-factor-authentication__illustration-screen">{ time }</div>
			<div className="two-factor-authentication__illustration-notification-container">
				<NotificationSvg />
			</div>
		</div>
	);
}
