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
}

export function mshotsUrl( url: string, count = 0 ): string {
	const mshotsUrl = 'https://s0.wp.com/mshots/v1/';
	const mShotsParams = {
		// viewport size (how much of the source page to capture)
		vpw: 1200,
		vph: 3072,
		// size of the resulting image
		w: 700,
		h: 1800,
	};
	const mshotsRequest = addQueryArgs( mshotsUrl + encodeURIComponent( url ), {
		...mShotsParams,
		// this doesn't seem to work:
		// requeue: true, // Uncomment this line to force the screenshots to be regenerated
		count,
	} );
	return mshotsRequest;
}

const MShotsImage = ( {
	url,
	'aria-labelledby': labelledby,
	alt,
}: MShotsImageProps ): JSX.Element => {
	const [ count, setCount ] = React.useState( 0 );
	const [ visible, setVisible ] = useState( false );
	return (
		<div className="mshots-image__container">
			{ ! visible && <div className="mshots-image__loader"></div> }
			<img
				className={ classnames( 'mshots-image' ) }
				style={ { opacity: visible ? 1 : 0 } }
				alt={ alt }
				aria-labelledby={ labelledby }
				src={ mshotsUrl( url, count ) }
				onLoad={ ( e ) => {
					// Test against mshots h value
					if ( e.currentTarget.naturalHeight !== 1800 ) {
						// Triggers a target.src change
						setTimeout( () => setCount( count + 1 ), 1000 );
					} else {
						setVisible( true );
					}
				} }
			/>
		</div>
	);
};

export default MShotsImage;
