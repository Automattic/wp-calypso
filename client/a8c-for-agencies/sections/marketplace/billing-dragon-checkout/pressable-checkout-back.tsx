import { useMutation } from '@tanstack/react-query';
import { Button, Notice, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchCanceledPressableReturn } from '../pressable-return/lib';

export default function PressableCheckoutBack( {
	agencyId,
	afterPurchaseUrl,
}: {
	agencyId: number;
	afterPurchaseUrl: string;
} ) {
	const dispatch = useDispatch();
	const inFlight = useRef( false );
	const isMounted = useRef( true );
	const { mutate, isPending, isSuccess, isError } = useMutation( {
		mutationFn: fetchCanceledPressableReturn,
		retry: false,
		gcTime: 0,
		onSuccess: ( url ) => {
			if ( isMounted.current ) {
				window.location.assign( url );
			}
		},
		onError: () => {
			inFlight.current = false;
		},
	} );

	useEffect( () => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, [] );

	const isBusy = isPending || isSuccess;
	return (
		<VStack spacing={ 2 }>
			<Button
				variant="tertiary"
				icon={ arrowLeft }
				disabled={ isBusy }
				isBusy={ isBusy }
				onClick={ () => {
					if ( inFlight.current ) {
						return;
					}
					inFlight.current = true;
					dispatch(
						recordTracksEvent( 'calypso_a4a_pressable_checkout_back', { retry: isError } )
					);
					mutate( { agencyId, afterPurchaseUrl } );
				} }
			>
				{ __( 'Back to Pressable' ) }
			</Button>
			{ isError && (
				<Notice status="error" isDismissible={ false }>
					{ __( 'We couldn’t return you to Pressable. Please try again.' ) }
				</Notice>
			) }
		</VStack>
	);
}
