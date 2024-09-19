import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import useBillingSummaryQuery from 'calypso/data/promote-post/use-promote-post-billing-summary-query';

function DebtNotifier() {
	const translate = useTranslate();

	const { data } = useBillingSummaryQuery();
	const debt = data?.debt ?? '0.00';

	if ( debt !== '0.00' ) {
		return (
			<div className="promote-post-i2__debt-notifier">
				{ sprintf( translate( 'Current debt is $%s.' ), debt.replace( '.00', '' ) ) }
			</div>
		);
	}

	return '';
}

export default DebtNotifier;
