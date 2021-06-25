/**
 * External dependencies
 */
import React from 'react';
import colorStudio from '@automattic/color-studio';

/**
 * Style dependencies
 */
import './push-notification-illustration.scss';

/**
 * Module constants
 */
const PALETTE = colorStudio.colors;
const COLOR_BLUE_10 = PALETTE[ 'WordPress Blue 10' ];
const COLOR_BLUE_20 = PALETTE[ 'WordPress Blue 20' ];
const COLOR_BLUE_40 = PALETTE[ 'WordPress Blue 40' ];
const COLOR_BLUE_50 = PALETTE[ 'WordPress Blue 50' ];
const COLOR_WHITE = PALETTE[ 'White' ]; // eslint-disable-line dot-notation

function DeviceSvg() {
	return (
		<svg className="two-factor-authentication__illustration-device">
			<g fill="none" fill-rule="evenodd">
				<path
					d="M76.405 0h199.19c19.613 0 26.725 2.042 33.896 5.877 7.17 3.835 12.797 9.462 16.632 16.632C329.958 29.68 332 36.792 332 56.405V179H20V56.405c0-19.613 2.042-26.725 5.877-33.896 3.835-7.17 9.462-12.797 16.632-16.632C49.68 2.042 56.792 0 76.405 0z"
					fill={ COLOR_BLUE_20 }
				/>
				<path
					d="M312 177.497c13.197.117 26.393.27 39.59.472.229.004.41.244.41.537 0 .288-.187.52-.41.524-58.565.901-117.13.81-175.694.97l-87.846-.168c-29.282-.183-58.564-.337-87.847-1.068-.114-.002-.203-.123-.203-.27 0-.143.093-.257.203-.26 13.266-.33 26.532-.543 39.797-.694V65.128c0-1.783.186-2.43.534-3.082a3.635 3.635 0 0 1 1.512-1.512c.652-.348 1.299-.534 3.082-.534h261.744c1.783 0 2.43.186 3.082.534.652.349 1.163.86 1.512 1.512.348.652.534 1.299.534 3.082v112.37z"
					fill={ COLOR_BLUE_40 }
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
		<svg className="two-factor-authentication__illustration-notification">
			<g fill="none" fill-rule="evenodd">
				<path
					d="M12.82 0h238.36c4.458 0 6.075.464 7.704 1.336a9.086 9.086 0 0 1 3.78 3.78c.872 1.63 1.336 3.246 1.336 7.703v31.362c0 4.457-.464 6.074-1.336 7.703a9.086 9.086 0 0 1-3.78 3.78c-1.63.872-3.246 1.336-7.703 1.336H12.819c-4.457 0-6.074-.464-7.703-1.336a9.086 9.086 0 0 1-3.78-3.78C.464 50.254 0 48.638 0 44.181V12.819c0-4.457.464-6.074 1.336-7.703a9.086 9.086 0 0 1 3.78-3.78C6.746.464 8.362 0 12.819 0z"
					fill={ COLOR_WHITE }
				/>
				<path
					d="M57.19 38.176c1.574-.697 3.146-.944 4.72-1.067l2.36-.14 2.359-.028c1.573.03 3.146.104 4.718.202 1.574.112 3.147.304 4.72.769.245.072.395.369.335.66a.51.51 0 0 1-.335.398c-1.573.464-3.146.656-4.72.77-1.572.097-3.145.17-4.718.2l-2.36-.027-2.36-.139c-1.573-.124-3.145-.37-4.718-1.069-.124-.054-.186-.217-.14-.364a.258.258 0 0 1 .14-.165zm0-10.548c5.174-.7 10.347-.947 15.52-1.07l7.76-.141 7.762-.024 15.52.204c5.173.138 10.347.29 15.521.765.244.023.428.279.41.572-.018.265-.196.47-.41.49-5.174.474-10.348.628-15.521.765l-15.52.204-7.761-.025-7.76-.14c-5.174-.123-10.347-.371-15.52-1.07-.124-.017-.211-.148-.198-.296.012-.124.097-.221.198-.234zm99.02-1.07l13.372-.141 13.37-.024 26.74.204c8.914.138 17.826.29 26.74.765.245.014.435.262.426.555-.01.276-.199.493-.425.506-8.915.475-17.827.629-26.741.766l-26.74.204-13.37-.025-13.371-.14c-8.914-.19-17.827-.338-26.74-1.07-.123-.01-.215-.137-.21-.284.01-.134.1-.237.21-.246 8.913-.733 17.826-.882 26.74-1.07zm-74.524 11.62c1.714-.196 3.43-.298 5.144-.447l5.146-.293c3.429-.18 6.859-.266 10.289-.33l10.29-.14 10.288-.024 20.58.205c6.86.137 13.72.289 20.578.764.246.018.434.268.422.561-.015.273-.198.485-.422.5-6.859.475-13.719.628-20.579.765l-20.579.205-10.288-.025-10.29-.139c-3.43-.064-6.86-.148-10.29-.331l-5.145-.292c-1.714-.15-3.43-.252-5.144-.448-.123-.013-.213-.143-.201-.29.01-.13.096-.228.2-.24zm147.473-21.854c1.624-.465 3.247-.63 4.87-.712l2.436-.093 2.435-.019c1.623.02 3.247.07 4.87.135 1.624.075 3.247.203 4.871.512.252.049.407.246.345.44-.044.136-.18.234-.345.266-1.624.31-3.247.437-4.871.513-1.623.065-3.247.114-4.87.134l-2.435-.019-2.435-.092c-1.624-.083-3.247-.247-4.87-.713-.128-.036-.192-.144-.144-.242a.22.22 0 0 1 .143-.11z"
					fill={ COLOR_BLUE_10 }
					fill-rule="nonzero"
				/>
				<path
					d="M57.095 17.026c1.86-.196 3.722-.299 5.582-.448l5.582-.292c3.722-.182 7.445-.266 11.166-.33l11.165-.14 11.165-.024 22.33.204c7.443.138 14.886.29 22.329.765.246.016.434.265.422.559-.013.272-.199.487-.422.501-7.443.475-14.886.629-22.33.765l-22.33.206-11.164-.026-11.165-.139c-3.721-.063-7.444-.148-11.166-.331l-5.582-.292c-1.86-.15-3.721-.252-5.582-.448-.122-.012-.214-.142-.202-.288.01-.13.096-.232.202-.242z"
					fill={ COLOR_BLUE_40 }
					fill-rule="nonzero"
				/>
				<path
					d="M20.974 12h14.052c3.12 0 4.252.325 5.393.935a6.36 6.36 0 0 1 2.646 2.646c.61 1.14.935 2.272.935 5.393v14.052c0 3.12-.325 4.252-.935 5.393a6.36 6.36 0 0 1-2.646 2.646c-1.14.61-2.272.935-5.393.935H20.974c-3.12 0-4.252-.325-5.393-.935a6.36 6.36 0 0 1-2.646-2.646c-.61-1.14-.935-2.272-.935-5.393V20.974c0-3.12.325-4.252.935-5.393a6.36 6.36 0 0 1 2.646-2.646c1.14-.61 2.272-.935 5.393-.935zM28 18c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-8.5 10a8.47 8.47 0 0 1 .736-3.46l4.054 11.11A8.503 8.503 0 0 1 19.5 28zm8.5 8.5c-.834 0-1.64-.12-2.4-.345l2.55-7.41 2.613 7.157c.017.042.038.08.06.117-.884.31-1.833.48-2.823.48v.001zm1.172-12.485c.512-.027.973-.08.973-.08.458-.055.404-.728-.054-.702 0 0-1.376.108-2.265.108-.835 0-2.24-.107-2.24-.107-.458-.026-.51.674-.053.7 0 0 .434.055.892.082l1.324 3.63-1.86 5.578-3.096-9.208c.512-.027.973-.08.973-.08.458-.055.403-.728-.055-.702 0 0-1.376.108-2.265.108-.16 0-.347-.003-.547-.01A8.489 8.489 0 0 1 28 19.5c2.213 0 4.228.846 5.74 2.232-.037-.002-.072-.007-.11-.007-.835 0-1.427.727-1.427 1.51 0 .7.404 1.292.835 1.993.323.566.7 1.293.7 2.344 0 .727-.28 1.572-.646 2.748l-.848 2.833-3.072-9.138zm3.1 11.332l2.597-7.506c.484-1.212.645-2.18.645-3.044 0-.313-.02-.603-.057-.874a8.495 8.495 0 0 1-3.185 11.425v-.001z"
					fill={ COLOR_BLUE_50 }
				/>
			</g>
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
