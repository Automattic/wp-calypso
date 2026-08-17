import { Button } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useTranslate } from 'i18n-calypso';
import { memo, ComponentProps } from 'react';
import EmptyValueIndicator from 'calypso/a8c-for-agencies/components/empty-value-indicator';
import FormattedDate from 'calypso/components/formatted-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import usePayInvoiceMutation from '../hooks/use-pay-invoice-mutation';
import InvoicesListRow from '../invoices-list-row';
import type { Invoice } from 'calypso/state/partner-portal/types';

import './style.scss';

function InvoicesListCard( { id, number, dueDate, status, total, currency, pdfUrl }: Invoice ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dueDateMoment = moment( dueDate );
	const payInvoice = usePayInvoiceMutation();

	let badgeIntent: ComponentProps< typeof Badge >[ 'intent' ] = 'default';
	let badgeLabel = translate( 'Draft' );

	switch ( status ) {
		case 'open':
			badgeIntent = 'info';
			badgeLabel = translate( 'Open' );

			if ( dueDateMoment.isBefore( moment() ) ) {
				badgeIntent = 'warning';
				badgeLabel = translate( 'Past due' );
			}
			break;

		case 'paid':
			badgeIntent = 'success';
			badgeLabel = translate( 'Paid' );
			break;

		case 'uncollectible':
			badgeIntent = 'error';
			badgeLabel = translate( 'Uncollectible' );
			break;

		case 'void':
			badgeIntent = 'default';
			badgeLabel = translate( 'Void' );
			break;
	}

	return (
		<InvoicesListRow>
			<div>{ number }</div>
			<div>
				{ dueDate && <FormattedDate date={ moment( dueDate ) } format="ll" /> }
				{ ! dueDate && <EmptyValueIndicator /> }
			</div>
			<div>
				<Badge intent={ badgeIntent }>{ badgeLabel }</Badge>
			</div>
			<div>{ formatCurrency( total, currency.toUpperCase() ) }</div>
			<div className="invoices-list-card__actions">
				{ status === 'open' && (
					<Button
						compact
						primary
						busy={ payInvoice.isPending }
						onClick={ () => payInvoice.mutate( { invoiceId: id } ) }
					>
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
