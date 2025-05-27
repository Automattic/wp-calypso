import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import type { Site } from '../../data/types';

export default function SitePreview( {
	site,
	width,
	style,
}: {
	site: Site;
	width: number;
	style?: React.CSSProperties;
} ) {
	const { URL: url } = site;
	// The /sites endpoint may return non-secure URLs. Often these _can_ be
	// loaded securely, so it's worth trying to load over https. If it fails,
	// there would have been an error either way because the dasboard is loaded
	// over https.
	// To do: check why the endpoint returns non-secure URLs when it will
	// redirect to a secure URL.
	const secureUrl = url.replace( /^http:\/\//, 'https://' );
	let updatedAtUrl = secureUrl;
	// See https://github.com/Automattic/wp-calypso/pull/66534.
	if ( site.options?.updated_at ) {
		const updatedAt = new Date( site.options.updated_at );
		updatedAt.setMinutes( 0 );
		updatedAt.setSeconds( 0 );
		updatedAtUrl = `${ secureUrl }?v=${ updatedAt.getTime() / 1000 }`;
	}
	const baseUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent( updatedAtUrl ) }`;
	const mshotWidth = 1280;
	const mshotHeight = 900;
	const aspectRatio = mshotWidth / mshotHeight;
	const [ isLoaded, setIsLoaded ] = useState< boolean | null >( null );
	useEffect( () => {
		( async () => {
			const maxRetries = 20;
			const retryDelay = 1000;
			for ( let i = maxRetries; i--;  ) {
				// mshot caches a 1280x960 image and then crops that, so we only
				// need to check the default size. If the width changes, we also
				// don't need to recheck.
				const response = await fetch( baseUrl, { method: 'HEAD' } );
				const isLoaded = response.status === 200 && ! response.redirected;
				setIsLoaded( isLoaded );
				if ( isLoaded ) {
					break;
				} else {
					await new Promise( ( resolve ) => setTimeout( resolve, retryDelay ) );
				}
			}
		} )();
	}, [ baseUrl ] );

	const title = __( 'Site Preview' );

	if ( ! isLoaded ) {
		const scale = width / mshotWidth;
		const xFrameOptionsSameOrigin = site.is_a8c && site.is_private;
		const loadIframe = isLoaded === false && ! xFrameOptionsSameOrigin;
		return (
			<div
				style={ {
					display: 'flex',
					alignItems: 'center',
					height: '100%',
				} }
			>
				<div style={ { width, height: width / aspectRatio } }>
					{ loadIframe && (
						// Do not load the iframe if isLoaded is null. We want
						// to wait until we know that an mshot is being
						// generated. Otherwise we will briefly load an iframe
						// and trigger needless requests.
						<iframe
							loading="lazy"
							// @ts-expect-error For some reason there's no inert type.
							inert="true"
							title={ title }
							// Hide banners + `preview` hides cookie banners + `iframe` hides
							// admin bar for atomic sites.
							src={ `${ secureUrl }/?hide_banners=true&preview=true&iframe=true` }
							style={ {
								display: 'block',
								border: 'none',
								transform: `scale(${ scale })`,
								transformOrigin: 'top left',
							} }
							width={ mshotWidth }
							height={ mshotHeight }
						/>
					) }
				</div>
			</div>
		);
	}
	// For every width, add a 2x and 3x width.
	const multiples = [ 1, 2, 3 ];
	return (
		<img
			loading="lazy"
			alt={ title }
			src={ `${ baseUrl }?w=${ width }` }
			srcSet={ multiples
				.map( ( multiple ) => `${ baseUrl }?w=${ width * multiple } ${ multiple }x` )
				.join( ', ' ) }
			style={ style }
			width={ width }
			height={ width / aspectRatio }
		/>
	);
}
