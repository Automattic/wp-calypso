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

export const globe: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="12" cy="12" r="8" stroke="#8C8F94" strokeWidth="1.5" />
		<path
			d="M12 4.36621C9.97145 5.38562 8.5 8.41786 8.5 12C8.5 15.6594 10.0356 18.7449 12.1321 19.6969"
			stroke="#8C8F94"
			strokeWidth="1.5"
		/>
		<path
			d="M12 4.36627C14.0286 5.38568 15.5 8.41792 15.5 12C15.5 15.5821 14.0286 18.6144 12 19.6338"
			stroke="#8C8F94"
			strokeWidth="1.5"
		/>
		<line x1="20" y1="14.5" x2="4" y2="14.5" stroke="#8C8F94" strokeWidth="1.5" />
		<line x1="4" y1="9.5" x2="20" y2="9.5" stroke="#8C8F94" strokeWidth="1.5" />
	</svg>
);

export const newSite: ReactElement = (
	<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14.5 4.5V7H16V4.5H18.5V3H16V0.5H14.5V3H12V4.5H14.5ZM8 3H2C0.895431 3 0 3.89543 0 5V17C0 18.1046 0.895431 19 2 19H14C15.1046 19 16 18.1046 16 17V11H14.5V17C14.5 17.2761 14.2761 17.5 14 17.5H2C1.72386 17.5 1.5 17.2761 1.5 17V5C1.5 4.72386 1.72386 4.5 2 4.5H8V3Z"
			fill="#8C8F94"
		/>
	</svg>
);

export const site: ReactElement = (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M3 9H21"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M9 21V9"
			stroke="#8C8F94"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<rect x="3" y="3" width="18" height="18" rx="1" stroke="#8C8F94" strokeWidth="1.6" />
	</svg>
);
