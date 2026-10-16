import { Path, SVG } from '@wordpress/primitives';

// @wordpress/icons has no pause or play icon.

export const pauseIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
	</SVG>
);

export const playIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M8 5.5v13l10.5-6.5z" />
	</SVG>
);
