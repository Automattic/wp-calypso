import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo } from 'react';
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
	const updatedAtUrl = useMemo( () => {
		// See https://github.com/Automattic/wp-calypso/pull/66534.
		if ( site.options?.updated_at ) {
			const updatedAt = new Date( site.options.updated_at );
			updatedAt.setMinutes( 0 );
			updatedAt.setSeconds( 0 );
			return `${ secureUrl }?v=${ updatedAt.getTime() / 1000 }`;
		}
		return secureUrl;
	}, [ site.options?.updated_at, secureUrl ] );
	const baseUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent( updatedAtUrl ) }`;
	const mshotWidth = 1280;
	const mshotHeight = 960;
	const aspectRatio = mshotWidth / mshotHeight;
	const [ isLoaded, setIsLoaded ] = useState< boolean | null >( null );
	const [ imageUrl, setImageUrl ] = useState< string >();
	useEffect( () => {
		( async () => {
			const maxRetries = 20;
			const retryDelay = 1000;
			for ( let i = maxRetries; i--;  ) {
				// mshot caches a 1280x960 image and then crops that, so we only
				// need to check the default size. If the width changes, we also
				// don't need to recheck.
				const response = await fetch( baseUrl, { method: 'HEAD' } );
				if ( response.status === 200 && ! response.redirected ) {
					// Prefetch the image and use a local blob URL to prevent a
					// flash when swapping out the iframe from the mshot.
					const imageResponse = await fetch( baseUrl );
					const imageBlob = await imageResponse.blob();
					setIsLoaded( true );
					setImageUrl( URL.createObjectURL( imageBlob ) );
					break;
				} else {
					setIsLoaded( false );
					await new Promise( ( resolve ) => setTimeout( resolve, retryDelay ) );
				}
			}
		} )();
	}, [ baseUrl ] );

	const title = __( 'Site Preview' );

	if ( ! isLoaded ) {
		const scale = width / mshotWidth;
		const loadIframe = isLoaded === false && ! site.is_private;
		return (
			<div style={ { display: 'flex', alignItems: 'center', height: '100%' } }>
				<div style={ { width, height: width / aspectRatio, overflow: 'hidden' } }>
					{ loadIframe && (
						// Do not load the iframe if isLoaded is null. We want
						// to wait until we know that an mshot is being
						// generated. Otherwise we will briefly load an iframe
						// and trigger needless requests.
						<iframe
							sandbox="allow-scripts"
							scrolling="no"
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
								// filter: 'blur(10px)',
							} }
							width={ mshotWidth }
							height={ mshotHeight }
						/>
					) }
				</div>
			</div>
		);
	}
	return (
		<img
			loading="lazy"
			alt={ title }
			src={ imageUrl }
			style={ { display: 'block', ...style } }
			width={ width }
			height={ width / aspectRatio }
		/>
	);
}
