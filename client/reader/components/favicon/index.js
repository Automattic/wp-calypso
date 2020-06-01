/**
 * External dependencies
 */
import React, { useState } from 'react';
import Gridicon from 'components/gridicon';

function Favicon( props ) {
	const { site, className, size } = props;
	const [ hasError, setError ] = useState( false );

	// if loading error show W Gridicon
	if ( hasError ) {
		return <Gridicon icon="my-sites" size={ 18 } className={ props.className } />;
	}

	if ( site.blavatar !== 'use_favicon' ) {
		return (
			<img
				onError={ setError }
				src={ site.blavatar }
				className={ className }
				width={ size }
				alt={ site.blavatar }
			/>
		);
	}

	const url = new URL( site.URL );
	let faviconUrl = window.URL && url && url.origin ? url.origin : props.url;
	faviconUrl += '/favicon.ico';

	return (
		<img
			onError={ setError }
			src={ faviconUrl }
			className={ className }
			width={ size }
			alt={ faviconUrl }
		/>
	);
}

export default Favicon;
