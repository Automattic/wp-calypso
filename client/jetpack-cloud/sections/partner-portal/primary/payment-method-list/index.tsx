import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import AddStoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/add-stored-credit-card';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import StoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card';
import StoredCreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card/stored-credit-card-loading';
import {
	getAllStoredCards,
	getStoredCardsPerPage,
	isFetchingStoredCards,
	hasMoreStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import type { ReactElement } from 'react';

import './style.scss';

const preparePagingCursor = (
	direction: 'next' | 'prev',
	items: PaymentMethod[],
	isFirstPage: boolean
) => {
	if ( ! items.length || isFirstPage ) {
		return {
			startingAfter: '',
			endingBefore: '',
		};
	}

	return {
		startingAfter: direction === 'next' ? items[ items.length - 1 ].id : '',
		endingBefore: direction === 'prev' ? items[ 0 ].id : '',
	};
};

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const isFetching = useSelector( isFetchingStoredCards );
	const perPage = useSelector( getStoredCardsPerPage );
	const hasMoreItems = useSelector( hasMoreStoredCards );
	const cards = storedCards.map( ( card: PaymentMethod ) => (
		<StoredCreditCard key={ card.id } card={ card } />
	) );

	const [ showPagination, setShowPagination ] = useState( false );
	const [ paging, setPaging ] = useState( { startingAfter: '', endingBefore: '' } );
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const onPageClick = ( pageNumber: number ) => {
		const direction = pageNumber > currentPage ? 'next' : 'prev';

		// Set a cursor for use in pagination.
		setPaging( preparePagingCursor( direction, storedCards, pageNumber === 1 ) );

		setCurrentPage( pageNumber );
	};

	// If the initial request has more items, we need to always display the pagination controls.
	useEffect( () => {
		if ( hasMoreItems ) {
			setShowPagination( true );
		}
	}, [ hasMoreItems ] );

	return (
		<Main wideLayout className="payment-method-list">
			<QueryJetpackPartnerPortalStoredCards paging={ paging } />
			<DocumentHead title={ translate( 'Payment Methods' ) } />
			<SidebarNavigation />

			<div className="payment-method-list__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Methods' ) }</CardHeading>
			</div>

			<div className="payment-method-list__body">
				{ isFetching && <StoredCreditCardLoading /> }

				{ ! isFetching && cards }

				<AddStoredCreditCard />
			</div>

			{ showPagination && (
				<Pagination
					className={ classNames( 'payment-method-list__pagination', {
						'payment-method-list__pagination--is-fetching': isFetching,
						'payment-method-list__pagination--no-more-items': ! hasMoreItems,
					} ) }
					pageClick={ onPageClick }
					page={ currentPage }
					perPage={ perPage }
				/>
			) }
		</Main>
	);
}
