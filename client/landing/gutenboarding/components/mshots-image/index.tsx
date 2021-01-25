/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';
import { addQueryArgs } from '@wordpress/url';

/**
 * Style dependencies
 */
import './style.scss';

interface MShotsImageProps {
	url: string;
	alt: string;
	'aria-labelledby': string;
	options: MShotsOptions;
}

export type MShotsOptions = {
	vpw: number;
	vph: number;
	w: number;
	h: number;
};

export function mshotsUrl( url: string, options: MShotsOptions, count = 0 ): string {
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( url ), {
		...options,
		count,
	} );
	return mshotsRequest;
}

const MAXTRIES = 10;

const MShotsImage = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
	options,
}: MShotsImageProps ): JSX.Element => {
	const [ count, setCount ] = React.useState( 1 );
	const [ visible, setVisible ] = useState( false );

	const src = mshotsUrl( url, options, count );

	return (
		<div className="mshots-image__container">
			{ ! visible && <div className="mshots-image__loader"></div> }
			<img
				className={ classnames( 'mshots-image' ) }
				style={ { opacity: visible ? 1 : 0 } }
				alt={ alt }
				aria-labelledby={ labelledby }
				src={ src }
				onLoad={ ( e ) => {
					// Test mshots h value matches the desired image
					// The default image (https://s0.wp.com/mshots/v1/default) is around 400x300 px h
					// but sometimes slightly off (e.g. h: 299.99)
					if ( e.currentTarget.naturalHeight !== options.h ) {
						// Only refresh 10 times
						if ( count < MAXTRIES ) {
							// Triggers a target.src change and image refresh @ 500ms, 1000ms, 1500ms...
							setTimeout( () => setCount( count + 1 ), count * 500 );
						}
					} else {
						setVisible( true );
					}
				} }
			/>
		</div>
	);
};

export default MShotsImage;
