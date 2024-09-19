import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Pagination from 'calypso/components/pagination';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import { useCursorPagination } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getAllStoredCards,
	getStoredCardsPerPage,
	isFetchingStoredCards,
	hasMoreStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import PartnerPortalSidebarNavigation from '../../sidebar-navigation';
import StoredCreditCardV2 from '../../stored-credit-card-v2';
import EmptyState from './empty-state';
import LoadingState from './loading-state';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

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

export default function PaymentMethodListV2() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const storedCards = useSelector( getAllStoredCards );
	const isFetching = useSelector( isFetchingStoredCards );

	const perPage = useSelector( getStoredCardsPerPage );
	const hasMore = useSelector( hasMoreStoredCards );
	const [ paging, setPaging ] = useState( { startingAfter: '', endingBefore: '' } );
	const onPageClickCallback = useCallback(
		( page: number, direction: 'next' | 'prev' ) => {
			// Set a cursor for use in pagination.
			setPaging( preparePagingCursor( direction, storedCards, page === 1 ) );
		},
		[ storedCards, setPaging ]
	);
	const [ page, showPagination, onPageClick ] = useCursorPagination(
		! isFetching,
		hasMore,
		onPageClickCallback
	);

	const title = translate( 'Payment Methods' );
	const subtitle = translate(
		"Add a payment method to issue licenses. It's auto-charged monthly."
	);

	const primaryCard = storedCards.find( ( card ) => card.is_default );
	const secondaryCards = storedCards.filter( ( card ) => ! card.is_default );
	const onAddNewCardClick = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_payments_add_new_card_button_click' ) );
	};

	const getBody = () => {
		if ( isFetching ) {
			return <LoadingState />;
		}

		if ( storedCards.length > 0 ) {
			return (
				<div className="payment-method-list-v2__stored-cards">
					{ primaryCard && <StoredCreditCardV2 creditCard={ primaryCard } /> }
					{ secondaryCards.map( ( card: PaymentMethod, index ) => (
						<StoredCreditCardV2
							key={ card.id }
							creditCard={ card }
							showSecondaryCardCount={ secondaryCards.length > 1 }
							secondaryCardCount={ index + 1 }
						/>
					) ) }
				</div>
			);
		}

		return (
			<div className="payment-method-list-v2-empty-state">
				<EmptyState />
			</div>
		);
	};

	const hasCards = ! isFetching && storedCards.length > 0;

	return (
		<Layout
			className="payment-method-list-v2"
			title={ title }
			sidebarNavigation={ <PartnerPortalSidebarNavigation /> }
			wide
		>
			<QueryJetpackPartnerPortalStoredCards paging={ paging } />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>{ subtitle }</Subtitle>
					<Actions>
						{ hasCards && (
							<Button
								href="/partner-portal/payment-methods/add"
								onClick={ onAddNewCardClick }
								primary
							>
								{ translate( 'Add new card' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ getBody() }
				{ hasCards && showPagination && (
					<Pagination
						className={ clsx( 'payment-method-list-v2__pagination', {
							'payment-method-list-v2__pagination--has-prev': page > 1,
							'payment-method-list-v2__pagination--has-next': isFetching || hasMore,
						} ) }
						pageClick={ onPageClick }
						page={ page }
						perPage={ perPage }
					/>
				) }
			</LayoutBody>
		</Layout>
	);
}
