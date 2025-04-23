import { useMemo } from 'react';
import type { Site } from '../data/types';

import './style.scss';

export default function SiteIcon( { site, size = 48 }: { site: Site; size?: number } ) {
	const dims = { width: size, height: size };
	const src = useMemo( () => {
		if ( ! site.media ) {
			return site.media;
		}
		const url = new URL( site.media );
		// wordpress.com/wp-content works with w.
		url.searchParams.set( 'w', '96' );
		// "blavatar" works with s.
		url.searchParams.set( 's', '96' );
		return url.toString();
	}, [ site.media ] );

	if ( site.media ) {
		return <img className="site-icon" src={ src } alt={ site.name } { ...dims } loading="lazy" />;
	}

	return (
		<div className="site-letter" style={ { ...dims, fontSize: size * 0.5 } }>
			<span>{ site.name.charAt( 0 ) }</span>
		</div>
	);
}
