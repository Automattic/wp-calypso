import { SVG, Path, Rect } from '@wordpress/components';

export const computer = (
	<SVG width="36" height="36" viewBox="0 0 36 36">
		<Rect x="6" y="9" width="24" height="18" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="3" y="26.5" width="30" height="1.5" fill="currentColor" />
	</SVG>
);

export const tablet = (
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Rect x="3" y="2" width="18" height="20" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="10" y="17" width="4" height="1.5" fill="currentColor" />
	</SVG>
);

export const phone = (
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Rect x="6" y="3" width="12" height="18" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
		<Rect x="11" y="17" width="2" height="1.5" fill="currentColor" />
	</SVG>
);

export const zoomIn = (
	<SVG width="18" height="18" viewBox="0 0 18 18" fill="none">
		<Path
			d="M13.5 7.5C13.5 10.8137 10.8137 13.5 7.5 13.5C4.18629 13.5 1.5 10.8137 1.5 7.5C1.5 4.18629 4.18629 1.5 7.5 1.5C10.8137 1.5 13.5 4.18629 13.5 7.5ZM12.2465 13.3073C10.9536 14.3652 9.30092 15 7.5 15C3.35786 15 0 11.6421 0 7.5C0 3.35786 3.35786 0 7.5 0C11.6421 0 15 3.35786 15 7.5C15 9.30098 14.3652 10.9537 13.3072 12.2466L18 16.9395L16.9393 18.0001L12.2465 13.3073ZM8.25 6.75H10.5V8.25H8.25V10.5H6.75V8.25H4.5V6.75H6.75V4.5H8.25V6.75Z"
			fillRule="evenodd"
			clipRule="evenodd"
			fill="currentColor"
		/>
	</SVG>
);

export const zoomOut = (
	<SVG width="18" height="18" viewBox="0 0 18 18" fill="none">
		<Path
			d="M7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5ZM7.5 15C9.30092 15 10.9536 14.3652 12.2465 13.3073L16.9393 18.0001L18 16.9395L13.3072 12.2466C14.3652 10.9537 15 9.30098 15 7.5C15 3.35786 11.6421 0 7.5 0C3.35786 0 0 3.35786 0 7.5C0 11.6421 3.35786 15 7.5 15ZM10.5 6.75H4.5V8.25H10.5V6.75Z"
			fillRule="evenodd"
			clipRule="evenodd"
			fill="currentColor"
		/>
	</SVG>
);
