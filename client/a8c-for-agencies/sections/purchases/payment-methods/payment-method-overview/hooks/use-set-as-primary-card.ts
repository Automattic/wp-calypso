import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import type { SetAsPrimaryCardProps } from 'calypso/jetpack-cloud/sections/partner-portal/types';

const NOTIFICATION_DURATION = 3000;

export function useSetAsPrimaryCard(): {
	setAsPrimaryCard: ( params: SetAsPrimaryCardProps ) => void;
	isSetAsPrimaryCardPending: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();

	// FIXME: Need to remove this with actual API call.
	const [ isSuccess, setIsSuccess ] = useState( false );
	const [ isPending, setIsPending ] = useState( false );
	const [ isError, setIsError ] = useState( false );
	const setAsPrimaryCard = ( { paymentMethodId }: SetAsPrimaryCardProps ) => {
		setIsPending( true );
		setIsError( false );
		setIsSuccess( false );
		setTimeout( () => {
			setIsPending( false );

			if ( paymentMethodId === '2' ) {
				setIsSuccess( true );
			} else {
				setIsError( true );
			}
		}, 1000 );
	};

	useEffect( () => {
		if ( isSuccess ) {
			// FIXME: Need to refetch cards

			dispatch(
				successNotice( translate( 'Card set as primary.' ), {
					duration: NOTIFICATION_DURATION,
					id: 'set-as-primary-card-success',
				} )
			);
		}
	}, [ dispatch, isSuccess, translate ] );

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'Something went wrong. Please try again.' ), {
					duration: NOTIFICATION_DURATION,
					id: 'set-as-primary-card-error',
				} )
			);
		}
	}, [ dispatch, isError, translate ] );

	return {
		setAsPrimaryCard,
		isSetAsPrimaryCardPending: isPending,
	};
}
