import { Badge, Button, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { memo, useCallback } from 'react';
import FormattedDate from 'calypso/components/formatted-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import InvoicesListRow from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list-row';
import usePayInvoiceMutation from 'calypso/state/partner-portal/invoices/hooks/pay-invoice-mutation';
import type { BadgeType } from '@automattic/components';
import type { Invoice } from 'calypso/state/partner-portal/types';

import './style.scss';

function InvoicesListCard( { id, number, dueDate, status, total, currency, pdfUrl }: Invoice ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dueDateMoment = moment( dueDate );
	const payInvoice = usePayInvoiceMutation();
	const pay = useCallback(
		() => payInvoice.mutate( { invoiceId: id } ),
		[ id, payInvoice.mutate ]
	);

	let badgeType: BadgeType = 'info';
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
			<div>{ number }</div>
			<div>
				{ dueDate && <FormattedDate date={ moment( dueDate ) } format="ll" /> }
				{ ! dueDate && <Gridicon icon="minus" /> }
			</div>
			<div>
				<Badge type={ badgeType }>{ badgeLabel }</Badge>
			</div>
			<div>{ formatCurrency( total, currency.toUpperCase() ) }</div>
			<div className="invoices-list-card__actions">
				{ status === 'open' && (
					<Button compact primary busy={ payInvoice.isPending } onClick={ pay }>
						{ translate( 'Pay' ) }
					</Button>
				) }

				{ pdfUrl && (
					<Button compact href={ pdfUrl } target="_blank" download>
						{ translate( 'Download' ) }
					</Button>
				) }
			</div>
		</InvoicesListRow>
	);
}

export default memo( InvoicesListCard );
