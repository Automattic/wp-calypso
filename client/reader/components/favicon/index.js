/**
 * External dependencies
 */
import React from 'react';

function Favicon( props ) {
	const addFallbackImage = ( e ) => {
		e.target.src = 'https://wordpress.com/favicon.ico';
	};

	const url = new URL( props.url );
	let faviconUrl = window.URL && url && url.origin ? url.origin : props.url;
	faviconUrl += '/favicon.ico';

	return (
		<img
			onError={ addFallbackImage }
			src={ faviconUrl }
			className={ props.className }
			width={ props.size }
			alt="favicon"
		/>
	);
}

export default Favicon;
