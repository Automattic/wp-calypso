import type { Site } from '../data/types';

import './style.scss';

export default function SiteIcon( { site, size = 48 }: { site: Site; size?: number } ) {
	const dims = { width: size, height: size };

	if ( site.media ) {
		return (
			<img className="site-icon" src={ site.media } alt={ site.name } { ...dims } loading="lazy" />
		);
	}

	return (
		<div className="site-letter" style={ { ...dims, fontSize: size * 0.5 } }>
			<span>{ site.name.charAt( 0 ) }</span>
		</div>
	);
}
