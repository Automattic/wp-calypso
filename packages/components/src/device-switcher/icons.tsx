import { Circle, SVG, Path, Rect } from '@wordpress/components';

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
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Circle cx="11" cy="11" r="7.25" stroke="currentColor" strokeWidth="1.5" />
		<Path d="M8 11H14M11 8V14" stroke="currentColor" strokeWidth="1.5" />
		<Path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" />
	</SVG>
);

export const zoomOut = (
	<SVG width="24" height="24" viewBox="0 0 24 24">
		<Circle cx="11" cy="11" r="7.25" stroke="currentColor" strokeWidth="1.5" />
		<Path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" />
		<Path d="M8 11H14" stroke="currentColor" strokeWidth="1.5" />
	</SVG>
);
