import colorStudio from '@automattic/color-studio';

import './push-notification-illustration.scss';

/**
 * Module constants
 */
const PALETTE = colorStudio.colors;

const COLOR_GREEN_40 = PALETTE[ 'Jetpack Green 40' ];

const COLOR_WHITE = PALETTE[ 'White' ]; // eslint-disable-line dot-notation

function NotificationSvg() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width={ 360 } height={ 160 } fill="none">
			<mask
				id="b"
				width={ 360 }
				height={ 160 }
				x={ 0 }
				y={ 0 }
				maskUnits="userSpaceOnUse"
				style={ {
					maskType: 'alpha',
				} }
			>
				<path fill="url(#a)" d="M0 0h360v160H0z" />
			</mask>
			<g mask="url(#b)">
				<mask id="c" fill={ COLOR_WHITE }>
					<path d="M0 48C0 21.49 21.49 0 48 0h264c26.51 0 48 21.49 48 48v242H0V48Z" />
				</mask>
				<path
					fill={ COLOR_WHITE }
					d="M0 48C0 21.49 21.49 0 48 0h264c26.51 0 48 21.49 48 48v242H0V48Z"
				/>
				<path
					fill="#E0E0E0"
					d="M-1 48C-1 20.938 20.938-1 48-1h264c27.062 0 49 21.938 49 49h-2c0-25.957-21.043-47-47-47H48C22.043 1 1 22.043 1 48h-2Zm361 242H0h360Zm-361 0V48C-1 20.938 20.938-1 48-1v2C22.043 1 1 22.043 1 48v242h-2ZM312-1c27.062 0 49 21.938 49 49v242h-2V48c0-25.957-21.043-47-47-47v-2Z"
					mask="url(#c)"
				/>
				<mask id="d" fill={ COLOR_WHITE }>
					<path d="M16 48c0-17.673 14.327-32 32-32h264c17.673 0 32 14.327 32 32v242H16V48Z" />
				</mask>
				<path
					fill="#F0F0F0"
					d="M16 48c0-17.673 14.327-32 32-32h264c17.673 0 32 14.327 32 32v242H16V48Z"
				/>
				<path
					fill="#E0E0E0"
					d="M15 48c0-18.225 14.775-33 33-33h264c18.225 0 33 14.775 33 33h-2c0-17.12-13.879-31-31-31H48c-17.12 0-31 13.88-31 31h-2Zm329 242H16h328Zm-329 0V48c0-18.225 14.775-33 33-33v2c-17.12 0-31 13.88-31 31v242h-2ZM312 15c18.225 0 33 14.775 33 33v242h-2V48c0-17.12-13.879-31-31-31v-2Z"
					mask="url(#d)"
				/>
				<rect width={ 295 } height={ 55 } x={ 32.5 } y={ 32.5 } fill={ COLOR_WHITE } rx={ 15.5 } />
				<rect width={ 295 } height={ 55 } x={ 32.5 } y={ 32.5 } stroke="#E0E0E0" rx={ 15.5 } />
				<g clipPath="url(#e)">
					<path
						fill={ COLOR_GREEN_40 }
						d="M59.977 48C53.371 48 48 53.371 48 59.977s5.371 11.977 11.977 11.977 11.977-5.371 11.977-11.977S66.583 48 59.977 48Zm-.617 13.966h-5.966l5.966-11.612v11.612Zm1.211 7.611V57.966h5.966l-5.966 11.611Z"
					/>
				</g>
				<path
					fill="#757575"
					d="M87.415 58.89h8.606v3.9h-8.606v-3.9Zm7.44 0h8.605v3.9h-8.605v-3.9Zm7.439 0h8.606v3.9h-8.606v-3.9Zm7.439 0h4.888v3.9h-4.888v-3.9Zm3.72 0h8.606v3.9h-8.606v-3.9Zm7.44 0h4.888v3.9h-4.888v-3.9Zm3.719 0h8.606v3.9h-8.606v-3.9Zm15.235 0h4.888v3.9h-4.888v-3.9Zm3.719 0h8.606v3.9h-8.606v-3.9Zm7.44 0h8.606v3.9h-8.606v-3.9Zm15.234 0h4.888v3.9h-4.888v-3.9Zm3.72 0h8.606v3.9h-8.606v-3.9Z"
				/>
			</g>
			<defs>
				<linearGradient
					id="a"
					x1={ 180 }
					x2={ 180 }
					y1={ 0 }
					y2={ 160 }
					gradientUnits="userSpaceOnUse"
				>
					<stop offset={ 0.464 } />
					<stop offset={ 1 } stopOpacity={ 0 } />
				</linearGradient>
				<clipPath id="e">
					<path fill={ COLOR_WHITE } d="M48 48h24v24H48z" />
				</clipPath>
			</defs>
		</svg>
	);
}

export default function PushNotificationIllustration() {
	return <NotificationSvg />;
}
