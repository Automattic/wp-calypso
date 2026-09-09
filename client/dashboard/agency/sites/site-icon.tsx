import clsx from 'clsx';
import { getSiteName } from './dataviews/site-data';
import type { AgencySite } from '@automattic/api-core';

import '../../components/site-icon/style.scss';

// Mirrors the dotcom SiteIcon: the real icon when the site has one, and the
// first-initial letter tile otherwise.
export default function AgencySiteIcon( { site, size }: { site: AgencySite; size: number } ) {
	const ico = site.icon?.img || site.icon?.ico;
	const className = clsx( { 'is-small': size <= 16 } );

	if ( ico ) {
		return (
			<img
				className={ clsx( 'site-icon', className ) }
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
					objectFit: 'cover',
				} }
			/>
		);
	}

	return (
		<div
			aria-hidden="true"
			className={ clsx( 'site-letter', className ) }
			style={ { width: size, height: size, minWidth: size, fontSize: size * 0.5 } }
		>
			<span>{ getSiteName( site ).charAt( 0 ) }</span>
		</div>
	);
}
