import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';

export function useNewDomainsNotification() {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		const queryParams = new URLSearchParams( window.location.search );
		const newDomains = queryParams.get( 'new-domains' );

		if ( newDomains ) {
			dispatch(
				successNotice(
					translate( 'Your domain is being setup.', 'Your domains are being set up.', {
						count: parseInt( newDomains ),
					} ),
					{
						duration: 10000,
					}
				)
			);
		}
	}, [ dispatch, translate ] );
}
