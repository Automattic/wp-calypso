import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';

export default function ThankYouNotice() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const queryParams = new URLSearchParams( window.location.search );
	const success = queryParams.get( 'success' );
	useEffect( () => {
		// /plans/example.wordpress.com?notice=plan-upgrade
		if ( success === 'plan-upgrade' ) {
			dispatch(
				successNotice( translate( 'Thank you for your purchase!' ), {
					duration: 5000,
				} )
			);
		}
	}, [ success, dispatch, translate ] );

	return null;
}
