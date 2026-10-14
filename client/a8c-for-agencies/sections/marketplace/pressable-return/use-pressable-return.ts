import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { clearOriginalReturnUrl, fetchPressableReturn } from './lib';
import type { ReturnParams } from './lib';

export default function usePressableReturn( {
	agencyId,
	receiptId,
	orderId,
	canceled,
}: ReturnParams ) {
	const [ attempt, setAttempt ] = useState( 0 );
	const { mutateAsync, isError } = useMutation( {
		mutationFn: fetchPressableReturn,
		retry: false,
		gcTime: 0,
	} );

	useEffect( () => {
		let active = true;
		mutateAsync( { agencyId, receiptId, orderId, canceled } )
			.then( ( url ) => {
				if ( active ) {
					clearOriginalReturnUrl( Number( agencyId ) );
					window.location.assign( url );
				}
			} )
			.catch( () => {
				// The mutation exposes the error for the return page's retry UI.
			} );
		return () => {
			active = false;
		};
	}, [ agencyId, receiptId, orderId, canceled, attempt, mutateAsync ] );

	return { isError, retry: () => setAttempt( ( value ) => value + 1 ) };
}
