import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { memo, useCallback } from 'react';
import Badge from 'calypso/components/badge';
import FormattedDate from 'calypso/components/formatted-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import InvoicesListRow from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list-row';
import usePayInvoiceMutation from 'calypso/state/partner-portal/invoices/hooks/pay-invoice-mutation';
import type { Invoice } from 'calypso/state/partner-portal/types';
import type { ReactElement } from 'react';

import './style.scss';

function InvoicesListCard( {
	id,
	dueDate,
	status,
	total,
	currency,
	pdfUrl,
}: Invoice ): ReactElement {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dueDateMoment = moment( dueDate );
	const payInvoice = usePayInvoiceMutation();
	const pay = useCallback( () => payInvoice.mutate( { invoiceId: id } ), [
		id,
		payInvoice.mutate,
	] );

	let badgeType = 'info';
	let badgeLabel = translate( 'Draft' );

	switch ( status ) {
		case 'open':
			badgeType = 'info-blue';
			badgeLabel = translate( 'Open' );

			if ( dueDateMoment.isBefore( moment() ) ) {
				badgeType = 'warning';
				badgeLabel = translate( 'Past due' );
			}
			break;

		case 'paid':
			badgeType = 'success';
			badgeLabel = translate( 'Paid' );
			break;

		case 'uncollectible':
			badgeType = 'error';
			badgeLabel = translate( 'Uncollectible' );
			break;

		case 'void':
			badgeType = 'info';
			badgeLabel = translate( 'Void' );
			break;
	}

	return (
		<InvoicesListRow>
			<div>
				<FormattedDate date={ moment( dueDate ) } format="ll" />
			</div>

			<div>
				<Badge type={ badgeType }>{ badgeLabel }</Badge>
			</div>

			<div>{ formatCurrency( total, currency.toUpperCase() ) }</div>

			<div className="invoices-list-card__actions">
				{ pdfUrl && (
					<Button compact href={ pdfUrl } target="_blank" download>
						{ translate( 'Download' ) }
					</Button>
				) }

				{ status === 'open' && (
					<Button compact primary busy={ payInvoice.isLoading } onClick={ pay }>
						{ translate( 'Pay' ) }
					</Button>
				) }
			</div>
		</InvoicesListRow>
	);
}

export default memo( InvoicesListCard );
