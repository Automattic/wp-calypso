/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	src: string;
	alt: string;
}

const MshotsImage: React.FunctionComponent< Props > = ( { src, alt } ) => {
	const [ resolvedUrl, setResolvedUrl ] = React.useState< string | undefined >();
	const [ count, setCount ] = React.useState( 0 );

	const mShotsEndpointUrl = src;

	React.useEffect( () => {
		async function fetchMshots() {
			const response = await window.fetch( mShotsEndpointUrl, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
			} );

			if ( response.ok && response.headers.get( 'Content-Type' ) === 'image/jpeg' ) {
				try {
					const blob = await response.blob();
					setResolvedUrl( window.URL.createObjectURL( blob ) );
				} catch ( e ) {
					setResolvedUrl( mShotsEndpointUrl );
				}
			}

			if ( response.status === 307 ) {
				const id = setTimeout( () => setCount( count + 1 ), 1000 );
				return () => clearTimeout( id );
			}
		}
		fetchMshots();
	}, [ mShotsEndpointUrl, count ] );

	return (
		<div className="mshots-image">
			{ ! resolvedUrl && <p>Loading...</p> }
			{ resolvedUrl && <img src={ src } alt={ alt } /> }
		</div>
	);
};

export default MshotsImage;
