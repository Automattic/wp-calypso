import { useMemo } from 'react';
import type { Site } from '../../data/types';

import './style.scss';

export default function SiteIcon( { site, size = 48 }: { site: Site; size?: number } ) {
	const dims = {
		width: size,
		height: size,
		style: { width: size, height: size },
	};
	const ico = site.icon?.ico;
	const src = useMemo( () => {
		if ( ! ico ) {
			return;
		}
		const url = new URL( ico );
		// wordpress.com/wp-content works with w.
		url.searchParams.set( 'w', '96' );
		// "blavatar" works with s.
		url.searchParams.set( 's', '96' );
		return url.toString();
	}, [ ico ] );

	if ( ico ) {
		return <img className="site-icon" src={ src } alt={ site.name } { ...dims } loading="lazy" />;
	}

	const hash = site.ID.toString( 8 ).repeat( 32 ).substring( 0, 32 );

	return (
		<img
			className="site-icon"
			src={ `https://www.gravatar.com/avatar/${ hash }?s=96&f=y&d=color` }
			alt={ site.name }
			{ ...dims }
			loading="lazy"
		/>
	);
}
