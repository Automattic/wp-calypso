import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTokenValidation } from 'calypso/state/invites/selectors';
import { warningNotice } from 'calypso/state/notices/actions';

export function useValidationNotifications() {
	const _ = useTranslate();
	const dispatch = useDispatch();

	const { failure } = useSelector( getTokenValidation );

	useEffect( () => failure && showValidationFailureNotice(), [ failure ] );

	function showValidationFailureNotice() {
		dispatch(
			warningNotice( _( 'Oops, something went wrong with the form validation.' ), {
				duration: 3000,
			} )
		);
	}
}
