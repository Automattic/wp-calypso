import { Snackbar } from '@wordpress/components';
import { createPortal, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import './style.scss';

function PurchaseNotice() {
	const [ hasPaymentNotice, setHasPaymentNotice ] = useState( false );
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		const noticePattern = /[&?]notice=([\w_-]+)/;
		const match = noticePattern.exec( document.location.search );
		const notice = match && match[ 1 ];
		if ( 'purchase-success' === notice ) {
			setHasPaymentNotice( true );
		}
	} );

	useEffect( () => {
		const portalParentElement = document.body;
		portalParentElement.appendChild( portalParent );

		return () => {
			portalParentElement.removeChild( portalParent );
		};
	}, [ portalParent ] );

	if ( ! hasPaymentNotice ) {
		return null;
	}
	const actions = [
		{
			onClick: () => setHasPaymentNotice( false ),
		},
	];
	const content = __(
		'Welcome to the pro plan! Premium blocks are now available to use.',
		'full-site-editing'
	);
	const snackbarContent = (
		<div className="wpcom-block-editor-purchase-notice">
			<Snackbar className="wpcom-block-editor-purchase-notice__snackbar" actions={ actions }>
				{ content }
			</Snackbar>
		</div>
	);
	return <>{ createPortal( snackbarContent, portalParent ) }</>;
}

export default PurchaseNotice;
