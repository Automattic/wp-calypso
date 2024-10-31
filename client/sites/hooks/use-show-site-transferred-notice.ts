import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';

export function useShowSiteTransferredNotice() {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	useEffect( () => {
		const url = new URL( window.location.href );
		if ( url.searchParams.get( 'site-transfer-confirm' ) === 'true' ) {
			dispatch( successNotice( __( 'Your site transfer succeeded!' ), { duration: 8000 } ) );

			// Remove query param without triggering a re-render
			url.searchParams.delete( 'site-transfer-confirm' );
			window.history.replaceState( null, '', url.toString() );
		}
	}, [ __, dispatch ] );
}
