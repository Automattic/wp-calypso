import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import './style.scss';

function PurchaseNotice() {
	const [ hasPaymentNotice, setHasPaymentNotice ] = useState( false );
	const { createNotice } = useDispatch( noticesStore );

	useEffect( () => {
		const noticePattern = /[&?]notice=([\w_-]+)/;
		const match = noticePattern.exec( document.location.search );
		const notice = match && match[ 1 ];
		if ( 'purchase-success' === notice && hasPaymentNotice === false ) {
			setHasPaymentNotice( true );
			createNotice(
				'info',
				__(
					'Welcome to the Pro plan! Premium blocks are now available to use.',
					'full-site-editing'
				),
				{
					isDismissible: true,
					type: 'snackbar',
				}
			);
		}
	} );

	return null;
}

export default PurchaseNotice;
