import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPressableReturn } from './lib';
import type { ReturnParams } from './lib';

export default function usePressableReturn( { agencyId, receiptId, orderId }: ReturnParams ) {
	const [ attempt, setAttempt ] = useState( 0 );
	const { mutateAsync, isError } = useMutation( {
		mutationFn: fetchPressableReturn,
		retry: false,
		gcTime: 0,
	} );

	useEffect( () => {
		let active = true;
		mutateAsync( { agencyId, receiptId, orderId } )
			.then( ( url ) => {
				if ( active ) {
					window.location.assign( url );
				}
			} )
			.catch( () => {
				// The mutation exposes the error for the return page's retry UI.
			} );
		return () => {
			active = false;
		};
	}, [ agencyId, receiptId, orderId, attempt, mutateAsync ] );

	return { isError, retry: () => setAttempt( ( value ) => value + 1 ) };
}
