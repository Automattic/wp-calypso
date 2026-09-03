import type { AgencySite } from '@automattic/api-core';

// TODO: make this fallback themeable (incl. dark mode) once A4A supports dark mode.
const FALLBACK_SITE_COLOR = 'linear-gradient( 45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4 )';

export default function AgencySiteIcon( { site, size }: { site: AgencySite; size: number } ) {
	const ico = site.icon?.img || site.icon?.ico;

	if ( ico ) {
		return (
			<img
				src={ ico }
				alt=""
				width={ size }
				height={ size }
				loading="lazy"
				style={ {
					display: 'block',
					boxSizing: 'border-box',
					flexShrink: 0,
					width: size,
					height: size,
					minWidth: size,
					borderRadius: 4,
					objectFit: 'cover',
					outline: '1px solid rgba( 0, 0, 0, 0.04 )',
					outlineOffset: -1,
				} }
			/>
		);
	}

	return (
		<span
			aria-hidden="true"
			style={ {
				display: 'block',
				boxSizing: 'border-box',
				flexShrink: 0,
				width: size,
				height: size,
				minWidth: size,
				borderRadius: 4,
				background: site.site_color || FALLBACK_SITE_COLOR,
			} }
		/>
	);
}
