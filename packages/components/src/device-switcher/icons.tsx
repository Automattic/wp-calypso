import { Circle, SVG, Path } from '@wordpress/components';

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
