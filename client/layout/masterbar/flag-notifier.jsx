/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import config from 'calypso/config';
import Item from './item';

export const FlagNotifier = React.memo( () => {
	if ( 'development' !== config( 'env_id' ) ) {
		return null;
	}
	const flagsToCheck = [ 'anchor-fm' ];
	return (
		<>
			{ flagsToCheck
				.filter( ( flag ) => config.isEnabled( flag ) )
				.map( ( flag ) => (
					<Item key={ flag } tooltip={ `Development flag ${ flag } enabled` }>
						{ flag }
					</Item>
				) ) }
		</>
	);
} );
export default FlagNotifier;
