import { useMemo } from 'react';
import type { Site } from '@automattic/api-core';

export function SiteIconThumb( { site }: { site: Site } ) {
	const ico = site.icon?.img || site.icon?.ico;
	const src = useMemo( () => {
		if ( ! ico ) {
			return undefined;
		}
		try {
			const url = new URL( ico );
			url.searchParams.set( 'w', '64' );
			url.searchParams.set( 's', '64' );
			return url.toString();
		} catch {
			return ico;
		}
	}, [ ico ] );

	if ( src ) {
		return (
			<img
				className="social-site-handoff-site-icon"
				src={ src }
				alt=""
				width={ 32 }
				height={ 32 }
				loading="lazy"
			/>
		);
	}

	const fallbackInitial = ( site.name || site.URL || '?' ).charAt( 0 );
	return (
		<div className="social-site-handoff-site-letter" aria-hidden="true">
			<span>{ fallbackInitial }</span>
		</div>
	);
}
