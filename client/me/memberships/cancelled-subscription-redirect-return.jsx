import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { successNotice } from 'calypso/state/notices/actions';
import { purchasesRoot } from '../purchases/paths';

function CancelledSubscriptionRedirectReturn( { translate } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		// redirect back to Purchases list
		dispatch(
			successNotice( translate( 'This item has been removed.' ), { displayOnNextPage: true } )
		);
		page( purchasesRoot );
	} );
}

export default connect( () => ( {} ) )(
	localize( withLocalizedMoment( CancelledSubscriptionRedirectReturn ) )
);
