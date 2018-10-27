/**
 * External dependencies
 *
 * @format
 */

import { useEffect, useState } from 'react';
import CancelablePromise from 'cancelable-promise';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

export default function useApiGet( version, path ) {
	const [ loading, setLoading ] = useState( true );
	const [ data, setData ] = useState( null );
	const [ error, setError ] = useState( null );

	useEffect(
		() => {
			const getPromise = new CancelablePromise( ( resolve, reject ) => {
				const requestPromise = wpcom.req.get( {
					path,
					query: {
						version,
					},
				} );
				requestPromise.then( resolve );
				requestPromise.catch( reject );
			} );

			setLoading( true );
			getPromise.then( d => {
				setData( d );
				return d;
			} );
			getPromise.catch( err => {
				setError( err );
				return err;
			} );
			getPromise.then( () => setLoading( false ), () => setLoading( false ) );

			return () => getPromise.cancel();
		},
		[ version, path ]
	);
	return {
		loading,
		data,
		error,
	};
}
