import { Snackbar } from '@wordpress/components';
import { useEffect, useState } from 'react';
import './style.scss';

function PurchaseNotice() {
	const [ hasPaymentNotice, setHasPaymentNotice ] = useState( false );

	useEffect( () => {
		const noticePattern = /[&?]notice=([\w_-]+)/;
		const match = noticePattern.exec( document.location.search );
		const notice = match && match[ 1 ];
		if ( 'purchase-success' === notice ) {
			setHasPaymentNotice( true );
		}
	} );

	if ( ! hasPaymentNotice ) {
		return null;
	}
	const actions = [
		{
			onClick: () => setHasPaymentNotice( false ),
		},
	];
	const content = 'Welcome to the pro plan! Premium blocks are now available to use.';
	return (
		<div className="wpcom-block-editor-purchase-notice">
			<Snackbar className="wpcom-block-editor-purchase-notice__snackbar" actions={ actions }>
				{ content }
			</Snackbar>
		</div>
	);
}

export default PurchaseNotice;
