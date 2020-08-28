/**
 * External dependencies
 */
import React, { useEffect } from 'react';

/**
 * Internal dependencies
 */
import notices from 'notices';

export default function useDisplayErrors( errorMessages ) {
	useEffect( () => {
		notices.error(
			errorMessages.errors.map( ( errorMessage ) => <p key={ errorMessage }>{ errorMessage }</p> )
		);
	}, [ errorMessages ] );
}
