import { useEffect, useState } from 'react';

async function waitForMshot( url: string, retryDelay = 1000, maxRetries = 20 ) {
	for ( let i = maxRetries; i--;  ) {
		const response = await fetch( url, { method: 'HEAD' } );
		if ( response.status === 200 && ! response.redirected ) {
			return true;
		}
		await new Promise( ( resolve ) => setTimeout( resolve, retryDelay ) );
	}
	return false;
}

export default function SitePreview( {
	url,
	width,
	style,
}: {
	url: string;
	width: number;
	style?: React.CSSProperties;
} ) {
	// The /sites endpoint may return non-secure URLs. Often these _can_ be
	// loaded securely, so it's worth trying to load over https. If it fails,
	// there would have been an error either way because the dasboard is loaded
	// over https.
	// To do: check why the endpoint returns non-secure URLs when it will
	// redirect to a secure URL.
	const secureUrl = url.replace( /^http:\/\//, 'https://' );
	const baseUrl = `https://s0.wp.com/mshots/v1/${ encodeURIComponent( secureUrl ) }`;
	const aspectRatio = 1280 / 900;
	const [ isLoaded, setIsLoaded ] = useState( false );
	useEffect( () => {
		// mshot caches a 1280x960 image and then crops that, so we only need to
		// check the default size. If the width changes, we also don't need to
		// recheck.
		waitForMshot( baseUrl ).then( setIsLoaded );
	}, [ baseUrl ] );
	if ( ! isLoaded ) {
		return <div style={ { width, height: width / aspectRatio } } />;
	}
	// For every width, add a 2x and 3x width.
	const multiples = [ 1, 2, 3 ];
	return (
		<img
			loading="lazy"
			alt="Site Preview"
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
