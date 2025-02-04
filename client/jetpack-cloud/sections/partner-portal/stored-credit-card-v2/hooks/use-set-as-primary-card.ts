import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { fetchStoredCards } from 'calypso/state/partner-portal/stored-cards/actions';
import useSetAsPrimaryCardMutation from 'calypso/state/partner-portal/stored-cards/hooks/use-set-as-primary-card-mutation';
import type { SetAsPrimaryCardProps } from 'calypso/jetpack-cloud/sections/partner-portal/types';

const NOTIFICATION_DURATION = 3000;

export function useSetAsPrimaryCard(): {
	setAsPrimaryCard: ( params: SetAsPrimaryCardProps ) => void;
	isSetAsPrimaryCardPending: boolean;
} {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { mutate, isPending, isSuccess, isError } = useSetAsPrimaryCardMutation( {
		retry: false,
	} );

	useEffect( () => {
		if ( isSuccess ) {
			dispatch(
				fetchStoredCards( {
					startingAfter: '',
					endingBefore: '',
				} )
			);
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
		setAsPrimaryCard: mutate,
		isSetAsPrimaryCardPending: isPending,
	};
}
