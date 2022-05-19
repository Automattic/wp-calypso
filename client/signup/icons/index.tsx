import { Path, SVG, Rect } from '@wordpress/components';
import type { ReactElement } from 'react';

export const build: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<mask id="path-1-inside-1" fill="white">
			<Rect x="1" y="3.5" width="22" height="18" rx="1" />
		</mask>
		<Rect
			x="1"
			y="3.5"
			width="22"
			height="18"
			rx="1"
			stroke="#8C8F94"
			strokeWidth="3.2"
			mask="url(#path-1-inside-1)"
		/>
		<mask id="path-2-inside-2" fill="white">
			<Rect x="10" y="3.5" width="13" height="11" rx="1" />
		</mask>
		<Rect
			x="10"
			y="3.5"
			width="13"
			height="11"
			rx="1"
			stroke="#8C8F94"
			strokeWidth="3.2"
			mask="url(#path-2-inside-2)"
		/>
		<Rect x="5" y="2" width="3" height="1.5" fill="#8C8F94" />
		<Path d="M16 2H19V3.5H16V2Z" fill="#8C8F94" />
	</SVG>
);

export const write: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path
			d="M20.24 12.24C21.3658 11.1142 21.9983 9.58722 21.9983 7.99504C21.9983 6.40285 21.3658 4.87588 20.24 3.75004C19.1142 2.62419 17.5872 1.9917 15.995 1.9917C14.4028 1.9917 12.8758 2.62419 11.75 3.75004L5 10.5V19H13.5L20.24 12.24Z"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path d="M16 8L2 22" stroke="#8C8F94" strokeWidth="1.6" strokeLinecap="square" />
		<Path
			d="M17.5 15H9"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</SVG>
);

export const play: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path d="M5 3L19 12L5 21V3Z" stroke="#8C8F94" strokeWidth="1.6" strokeLinecap="round" />
	</SVG>
);

export const design: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path
			d="M3 9H21"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path
			d="M9 21V9"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Rect x="3" y="3" width="18" height="18" rx="1" stroke="#8C8F94" strokeWidth="1.6" />
	</SVG>
);

export const computer: ReactElement = (
	<SVG width="36" height="36" viewBox="0 0 36 36">
		<Rect x="6" y="9" width="24" height="18" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="3" y="26.5" width="30" height="1.5" fill="currentColor" />
	</SVG>
);

export const tablet: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Rect x="3" y="2" width="18" height="20" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="10" y="17" width="4" height="1.5" fill="currentColor" />
	</SVG>
);

export const phone: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Rect x="6" y="3" width="12" height="18" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="11" y="17" width="2" height="1.5" fill="currentColor" />
	</SVG>
);

export const tip: ReactElement = (
	<SVG width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<ellipse cx="10" cy="7" rx="5" ry="5" stroke="#A7AAAD" strokeWidth="1.3" />
		<line x1="6.99994" y1="14.9816" x2="12.9999" y2="14.9816" stroke="#A7AAAD" strokeWidth="1.3" />
		<line x1="8" y1="17.35" x2="12" y2="17.35" stroke="#A7AAAD" strokeWidth="1.3" />
	</SVG>
);

export const bulb: ReactElement = (
	<svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M3.2 14.4H8V16H3.2V14.4ZM9.5248 9.3696C10.3488 8.4048 11.2 7.4072 11.2 5.6C11.2 2.5128 8.6872 0 5.6 0C2.5128 0 0 2.5128 0 5.6C0 7.428 0.8536 8.4224 1.6808 9.384C1.9672 9.7184 2.264 10.0648 2.548 10.4632C2.6632 10.628 2.852 11.26 3.0208 12H2.4V13.6H8.8V12H8.1808C8.3512 11.2584 8.5408 10.6248 8.6552 10.46C8.9368 10.0576 9.236 9.708 9.5248 9.3696ZM7.3456 9.54C6.9984 10.0336 6.7088 11.2 6.5408 12H4.66C4.4928 11.1984 4.2024 10.0296 3.8512 9.536C3.551 9.12347 3.23172 8.72517 2.8944 8.3424C2.1152 7.4352 1.6 6.8352 1.6 5.6C1.6 3.3944 3.3944 1.6 5.6 1.6C7.8056 1.6 9.6 3.3944 9.6 5.6C9.6 6.8168 9.0856 7.4192 8.308 8.3304C8.0096 8.6808 7.6712 9.0768 7.3456 9.54V9.54Z"
			fill="#A7AAAD"
		/>
	</svg>
);

export const check: ReactElement = (
	<svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M82.4087 41.9905C82.4087 52.4607 78.2507 62.5023 70.8489 69.9077C63.4471 77.313 53.4074 81.4758 42.9372 81.4809C35.0449 70.4373 30.6458 57.2807 30.3081 43.7111C29.9705 30.1415 33.7099 16.7825 41.0432 5.3601L42.9372 2.50011C53.4074 2.50513 63.4471 6.66792 70.8489 14.0733C78.2507 21.4786 82.4087 31.5202 82.4087 41.9905Z"
			fill="#EFEFEF"
		/>
		<path
			d="M82.4086 41.9906C82.4086 52.7052 78.1522 62.9811 70.5758 70.5575C62.9995 78.1338 52.7237 82.3903 42.0091 82.3903C31.2944 82.3903 21.0186 78.1338 13.4422 70.5575C5.86583 62.9811 1.60947 52.7052 1.60947 41.9906C1.60392 39.5124 1.83224 37.0391 2.29135 34.6038C4.13398 24.702 9.60875 15.8456 17.6423 9.77087C25.6759 3.69614 35.6889 0.841432 45.7181 1.76611C55.7473 2.69079 65.0695 7.3283 71.8569 14.7695C78.6444 22.2107 82.4075 31.9188 82.4086 41.9906V41.9906Z"
			stroke="#003A5F"
			stroke-width="1.68"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M28 45.4943L37.8102 54.0742L56.5989 28.4102"
			stroke="#003A5F"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
);

export const jetpack: ReactElement = (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20Z"
			fill="#069E08"
		/>
		<path d="M10.4995 8.31396V18.0086L15.4995 8.31396H10.4995Z" fill="white" />
		<path d="M9.47725 11.6741V1.99854L4.49634 11.6741H9.47725Z" fill="white" />
	</svg>
);

export const upload: ReactElement = (
	<SVG width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path d="M12 13V21" stroke="#8C8F94" strokeWidth="1.5" strokeLinecap="square" />
		<Path
			d="M20.39 18.39C21.3653 17.8583 22.1358 17.0169 22.5798 15.9986C23.0239 14.9804 23.1162 13.8432 22.8422 12.7667C22.5682 11.6901 21.9434 10.7355 21.0666 10.0534C20.1898 9.37137 19.1108 9.00072 18 8.99998H16.74C16.4373 7.82923 15.8731 6.74232 15.0899 5.82098C14.3067 4.89964 13.3248 4.16783 12.2181 3.68059C11.1113 3.19335 9.90851 2.96334 8.70008 3.00787C7.49164 3.05239 6.30903 3.37028 5.24114 3.93765C4.17325 4.50501 3.24787 5.30709 2.53458 6.28357C1.82129 7.26004 1.33865 8.38552 1.12294 9.57538C0.90723 10.7652 0.964065 11.9885 1.28917 13.1532C1.61428 14.318 2.1992 15.3938 2.99996 16.3"
			stroke="#8C8F94"
			strokeWidth="1.5"
			strokeLinecap="square"
		/>
		<Path d="M16 16L12 12L8 16" stroke="#8C8F94" strokeWidth="1.5" strokeLinecap="square" />
	</SVG>
);

export const truck: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M16 3H1V16H16V3Z"
			stroke="#787C82"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M16 8H20L23 11V16H16V8Z"
			stroke="#787C82"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z"
			stroke="#787C82"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z"
			stroke="#787C82"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const shoppingBag: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
			stroke="#8C8F94"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M3 6H21"
			stroke="#8C8F94"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
			stroke="#8C8F94"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const shoppingCart: ReactElement = (
	<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
		<path
			d="m9 22c.55228 0 1-.4477 1-1s-.44772-1-1-1-1 .4477-1 1 .44772 1 1 1z"
			stroke="#8c8f94"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
		<path
			d="m20 22c.5523 0 1-.4477 1-1s-.4477-1-1-1-1 .4477-1 1 .4477 1 1 1z"
			stroke="#8c8f94"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
		<path
			d="m1 1h4l2.68 13.39c.09144.4604.34191.874.70755 1.1683.36563.2943.82315.4507 1.29245.4417h9.72c.4693.009.9268-.1474 1.2925-.4417.3656-.2943.6161-.7079.7075-1.1683l1.6-8.39h-17"
			stroke="#8c8f94"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
		/>
	</svg>
);

export const award: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M8.21 13.8899L7 22.9999L12 19.9999L17 22.9999L15.79 13.8799"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const frame: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<mask id="mask0_2727_2533" maskUnits="userSpaceOnUse" x="3" y="4" width="18" height="16">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M5 4H19C20.11 4 21 4.9 21 6V18C21 19.1 20.1 20 19 20H5C3.89 20 3 19.1 3 18V6C3 4.9 3.89 4 5 4ZM5 18H19V8H5V18Z"
				fill="white"
			/>
		</mask>
		<g mask="url(#mask0_2727_2533)">
			<rect width="24" height="24" fill="#8C8F94" />
		</g>
	</svg>
);

export const headset: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M7 17C8.105 17 9 16.105 9 15V11C9 9.895 8.105 9 7 9C5.895 9 5 9.895 5 11V15C5 16.105 5.895 17 7 17Z"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M17 17C18.105 17 19 16.105 19 15V11C19 9.895 18.105 9 17 9C15.895 9 15 9.895 15 11V15C15 16.105 15.895 17 17 17Z"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M1 13V12C1 5.925 5.925 1 12 1C18.075 1 23 5.925 23 12V17C23 19.209 21.209 21 19 21H14"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M12 23C13.1046 23 14 22.1046 14 21C14 19.8954 13.1046 19 12 19C10.8954 19 10 19.8954 10 21C10 22.1046 10.8954 23 12 23Z"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
);

export const mouse: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M5 9H19"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M12 1V9"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M12 23C8.134 23 5 19.866 5 16V5C5 2.791 6.791 1 9 1H15C17.209 1 19 2.791 19 5V16C19 19.866 15.866 23 12 23Z"
			stroke="#8C8F94"
			stroke-width="1.6"
			stroke-miterlimit="10"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
);
