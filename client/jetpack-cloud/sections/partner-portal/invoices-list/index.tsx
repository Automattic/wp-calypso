import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { memo, useCallback, useEffect, useState } from 'react';
import Pagination from 'calypso/components/pagination';
import { useCursorPagination } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import InvoicesListCard from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list-card';
import InvoicesListRow from 'calypso/jetpack-cloud/sections/partner-portal/invoices-list-row';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import useInvoicesQuery from 'calypso/state/partner-portal/invoices/hooks/use-invoices-query';

import './style.scss';

const InvoicePlaceholderCard = memo( () => {
	return (
		<InvoicesListRow>
			<div>
				<TextPlaceholder />
			</div>

			<div>
				<TextPlaceholder />
			</div>

			<div>
				<TextPlaceholder />
			</div>

			<div>
				<TextPlaceholder />
			</div>

			<div>
				<TextPlaceholder />
			</div>
		</InvoicesListRow>
	);
} );

export default function InvoicesList() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ pagination, setPagination ] = useState( { starting_after: '', ending_before: '' } );
	const invoices = useInvoicesQuery( pagination );

	useEffect( () => {
		if ( invoices.isError ) {
			dispatch(
				errorNotice( translate( 'We were unable to retrieve your invoices.' ), {
					id: 'partner-portal-invoices-failure',
					duration: 5000,
				} )
			);
		}
	}, [ dispatch, translate, invoices.isError ] );

	const hasMore = invoices.isSuccess ? invoices.data.hasMore : false;
	const onNavigateCallback = useCallback(
		( page: number, direction: 'next' | 'prev' ) => {
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
			<InvoicesListRow header>
				<div>{ translate( 'Number' ) }</div>
				<div>{ translate( 'Due Date' ) }</div>
				<div>{ translate( 'Status' ) }</div>
				<div>{ translate( 'Total' ) }</div>
				<div />
			</InvoicesListRow>

			{ invoices.isSuccess &&
				! invoices.isFetching &&
				invoices.data.items.map( ( invoice ) => (
					<InvoicesListCard
						key={ invoice.id }
						id={ invoice.id }
						number={ invoice.number }
						dueDate={ invoice.dueDate }
						created={ invoice.created }
						effectiveAt={ invoice.effectiveAt }
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
					className={ clsx( 'invoices-list__pagination', {
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
