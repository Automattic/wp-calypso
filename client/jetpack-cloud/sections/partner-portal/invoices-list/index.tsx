import { Button, Card } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { memo, ReactElement, useCallback, useState } from 'react';
import Badge from 'calypso/components/badge';
import FormattedDate from 'calypso/components/formatted-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Pagination from 'calypso/components/pagination';
import { useCursorPagination } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import useInvoicesQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';
import type { Invoice } from 'calypso/state/partner-portal/types';
import './style.scss';

// Component extracted for readability and not meant to be reusable as the header and card grid (.invoice-list__row)
// have to be identical for the faux table columns to align visually.
function InvoiceCard( { dueDate, status, total, currency, pdfUrl }: Invoice ): ReactElement {
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
		<Card compact>
			<div className="invoices-list__row">
				<div className="invoices-list__due-date">
					<FormattedDate date={ moment( dueDate ) } format="ll" />
				</div>

				<div className="invoices-list__status">
					<Badge type={ badgeType }>{ badgeLabel }</Badge>
				</div>

				<div className="invoices-list__total">
					{ formatCurrency( total, currency.toUpperCase() ) }
				</div>

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

const InvoicePlaceholderCard = memo( (): ReactElement => {
	return (
		<Card compact>
			<div className="invoices-list__row">
				<div className="invoices-list__due-date">
					<TextPlaceholder />
				</div>

				<div className="invoices-list__status">
					<TextPlaceholder />
				</div>

				<div className="invoices-list__total">
					<TextPlaceholder />
				</div>

				<div className="invoices-list__download">
					<TextPlaceholder />
				</div>
			</div>
		</Card>
	);
} );

export default function InvoicesList(): ReactElement {
	const translate = useTranslate();
	const [ pagination, setPagination ] = useState( { starting_after: '', ending_before: '' } );
	const invoices = useInvoicesQuery( pagination );
	const hasMore = invoices.isSuccess ? invoices.data.hasMore : false;
	const onNavigateCallback = useCallback(
		( page, direction ) => {
			if ( ! invoices.isSuccess || invoices.data.items.length === 0 ) {
				return;
			}

			if ( page <= 1 ) {
				setPagination( {
					starting_after: '',
					ending_before: '',
				} );
				return;
			}

			const items = invoices.data?.items;

			setPagination(
				direction === 'next'
					? {
							starting_after: items[ items.length - 1 ].id,
							ending_before: '',
					  }
					: {
							starting_after: '',
							ending_before: items[ 0 ].id,
					  }
			);
		},
		[ invoices.isSuccess, invoices.data?.items, setPagination ]
	);
	const [ page, showPagination, onNavigate ] = useCursorPagination(
		! invoices.isFetching,
		hasMore,
		onNavigateCallback
	);

	return (
		<div className="invoices-list">
			<Card compact className="invoices-list__header">
				<div className="invoices-list__row">
					<div>{ translate( 'Due Date' ) }</div>
					<div>{ translate( 'Status' ) }</div>
					<div>{ translate( 'Total' ) }</div>
					<div />
				</div>
			</Card>

			{ invoices.isSuccess &&
				! invoices.isFetching &&
				invoices.data.items.map( ( invoice ) => (
					<InvoiceCard
						key={ invoice.id }
						id={ invoice.id }
						dueDate={ invoice.dueDate }
						status={ invoice.status }
						total={ invoice.total }
						currency={ invoice.currency }
						pdfUrl={ invoice.pdfUrl }
					/>
				) ) }

			{ invoices.isFetching && (
				<>
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
					<InvoicePlaceholderCard />
				</>
			) }

			{ showPagination && (
				<Pagination
					className={ classnames( 'invoices-list__pagination', {
						'invoices-list__pagination--has-prev': page > 1,
						'invoices-list__pagination--has-next': invoices.isFetching || hasMore,
					} ) }
					pageClick={ onNavigate }
					page={ page }
					perPage={ 10 }
				/>
			) }
		</div>
	);
}
