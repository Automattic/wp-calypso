/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Spinner } from '@wordpress/components';

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
	const [ isVisible, setIsVisible ] = React.useState( false );

	const mShotsEndpointUrl = src;

	React.useEffect( () => {
		async function fetchMshots() {
			const response = await window.fetch( mShotsEndpointUrl, {
				method: 'GET',
				mode: 'cors',
				// cache: 'no-cache',
			} );

			if ( response.ok && response.headers.get( 'Content-Type' ) === 'image/jpeg' ) {
				setResolvedUrl( mShotsEndpointUrl );
			}

			if ( response.status === 307 ) {
				const id = setTimeout( () => setCount( count + 1 ), 1000 );
				return () => clearTimeout( id );
			}
		}
		fetchMshots();
	}, [ mShotsEndpointUrl, count ] );

	return (
		<div className="mshots-image__container">
			{ ( ! resolvedUrl || ! isVisible ) && (
				<p className="mshots-image__loader">
					<Spinner />
				</p>
			) }
			{ resolvedUrl && (
				<img
					className={ classnames( 'mshots-image', {
						'mshots-image-visible': isVisible,
					} ) }
					src={ src }
					alt={ alt }
					onLoad={ () => setIsVisible( true ) }
				/>
			) }
		</div>
	);
};

export default MshotsImage;
