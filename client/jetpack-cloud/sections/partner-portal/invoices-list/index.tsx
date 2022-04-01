import { Button, Card, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import Badge from 'calypso/components/badge';
import FormattedDate from 'calypso/components/formatted-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import useInvoicesQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';
import type { Invoice } from 'calypso/state/partner-portal/types';
import './style.scss';

function InvoiceCard( { dueDate, status, total, pdfUrl }: Invoice ): ReactElement {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dueDateMoment = moment( dueDate );

	let badgeType = 'info';
	let badgeLabel = translate( 'Draft' );

	switch ( status ) {
		case 'open':
			badgeType = 'info-blue';
			badgeLabel = translate( 'Open' );

			if ( dueDateMoment.isBefore( moment() ) ) {
				badgeType = '';
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
		<Card compact>
			<div className="invoices-list__row">
				<div className="invoices-list__due-date">
					<FormattedDate date={ moment( dueDate * 1000 ) } format="ll" />
				</div>

				<div className="invoices-list__status">
					<Badge type={ badgeType }>{ badgeLabel }</Badge>
				</div>

				<div className="invoices-list__total">{ formatCurrency( total, 'USD' ) }</div>

				<div className="invoices-list__download">
					{ pdfUrl && (
						<Button compact href={ pdfUrl } download>
							{ translate( 'Download' ) }
						</Button>
					) }
				</div>
			</div>
		</Card>
	);
}

export default function InvoicesList(): ReactElement {
	const translate = useTranslate();
	const invoices = useInvoicesQuery();

	return (
		<div className="invoices-list">
			<Card compact className="invoices-list__header">
				<div className="invoices-list__row">
					<div>{ translate( 'Due Date' ) }</div>
					<div>{ translate( 'Status' ) }</div>
					<div>{ translate( 'Total' ) }</div>
					<div></div>
				</div>
			</Card>

			{ invoices.isSuccess &&
				invoices.data.map( ( invoice ) => (
					<InvoiceCard
						key={ invoice.id }
						id={ invoice.id }
						dueDate={ invoice.dueDate }
						status={ invoice.status }
						total={ invoice.total }
						pdfUrl={ invoice.pdfUrl }
					/>
				) ) }

			{ ! invoices.isSuccess && (
				<Card compact>
					<div className="invoices-list__row">
						<div className="invoices-list__due-date">
							{ invoices.isLoading && <TextPlaceholder /> }

							{ invoices.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="invoices-list__status">
							{ invoices.isLoading && <TextPlaceholder /> }

							{ invoices.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="invoices-list__total">
							{ invoices.isLoading && <TextPlaceholder /> }

							{ invoices.isError && <Gridicon icon="minus" /> }
						</div>

						<div className="invoices-list__download">
							{ invoices.isLoading && <TextPlaceholder /> }

							{ invoices.isError && <Gridicon icon="minus" /> }
						</div>
					</div>
				</Card>
			) }
		</div>
	);
}
