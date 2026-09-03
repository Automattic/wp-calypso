import { Icon, backup, comment, page, rss, video } from '@wordpress/icons';
import { Path, SVG } from '@wordpress/primitives';
import type { ReactElement } from 'react';

// Glyphs `@wordpress/icons` does not carry.
const help = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 16v-2h2v2h-2zm2-3v-1.141A3.991 3.991 0 0016 10a4 4 0 00-8 0h2c0-1.103.897-2 2-2s2 .897 2 2-.897 2-2 2a1 1 0 00-1 1v2h2z"
		/>
	</SVG>
);

const askAi = (
	<SVG viewBox="-45 -45 490 490" xmlns="http://www.w3.org/2000/svg">
		<Path d="M391.528 188.061L309.455 159.75C276.997 148.597 251.403 123.003 240.25 90.5451L211.939 8.47185C208.079 -2.82395 191.921 -2.82395 188.061 8.47185L159.75 90.5451C148.597 123.003 123.003 148.597 90.5451 159.75L8.47185 188.061C-2.82395 191.921 -2.82395 208.079 8.47185 211.939L90.5451 240.25C123.003 251.403 148.597 276.997 159.75 309.455L188.061 391.528C191.921 402.824 208.079 402.824 211.939 391.528L240.25 309.455C251.403 276.997 276.997 251.403 309.455 240.25L391.528 211.939C402.824 208.079 402.824 191.921 391.528 188.061ZM295.728 206.077L254.692 220.232C238.391 225.809 225.666 238.677 220.089 254.835L205.934 295.871C203.932 301.591 195.925 301.591 193.923 295.871L179.768 254.835C174.191 238.534 161.323 225.809 145.165 220.232L104.129 206.077C98.4093 204.075 98.4093 196.068 104.129 194.066L145.165 179.911C161.466 174.334 174.191 161.466 179.768 145.308L193.923 104.272C195.925 98.5523 203.932 98.5523 205.934 104.272L220.089 145.308C225.666 161.609 238.534 174.334 254.692 179.911L295.728 194.066C301.448 196.068 301.448 204.075 295.728 206.077Z" />
	</SVG>
);

const ICONS: Record< string, ReactElement > = {
	comment,
	backup,
	page,
	video,
	rss,
	help,
	'ask-ai': askAi,
};

export function adminBarIcon(
	name: string | undefined,
	className: string
): ReactElement | undefined {
	const icon = name && Object.hasOwn( ICONS, name ) ? ICONS[ name ] : undefined;

	if ( ! icon ) {
		return undefined;
	}

	return (
		<span className={ className }>
			<Icon icon={ icon } />
		</span>
	);
}
