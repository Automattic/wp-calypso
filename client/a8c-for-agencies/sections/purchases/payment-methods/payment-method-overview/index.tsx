import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
	LayoutHeaderSubtitle as Subtitle,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_PAYMENT_METHODS_ADD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import Pagination from 'calypso/components/pagination';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { PaymentMethodOverviewContext } from '../context';
import useStoredCards from '../hooks/use-stored-cards';
import useStoredCardsPagination from '../hooks/use-stored-cards-pagination';
import EmptyState from './empty-state';
import LoadingState from './loading-state';
import StoredCreditCard from './stored-credit-card';
import type { StoredCardPaging } from '../types';

import './style.scss';

export default function PaymentMethodOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ paging, setPaging ] = useState< StoredCardPaging | undefined >( undefined );

	const {
		data: {
			allStoredCards,
			primaryStoredCard,
			secondaryStoredCards,
			pageSize,
			hasStoredCards,
			hasMoreStoredCards,
		},
		isFetching,
	} = useStoredCards( paging );

	const { page, showPagination, onPageClick } = useStoredCardsPagination( {
		storedCards: allStoredCards,
		enabled: ! isFetching,
		hasMoreStoredCards,
		setPaging,
	} );

	const onAddNewCardClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_payments_add_new_card_button_click' ) );
	}, [ dispatch ] );

	const content = useMemo( () => {
		if ( isFetching ) {
			return <LoadingState />;
		}

		if ( hasStoredCards ) {
			return (
				<PaymentMethodOverviewContext.Provider value={ { paging, setPaging } }>
					<div className="payment-method-overview__stored-cards">
						{ primaryStoredCard && <StoredCreditCard creditCard={ primaryStoredCard } /> }
						{ secondaryStoredCards.map( ( card: PaymentMethod, index: number ) => (
							<StoredCreditCard
								key={ card.id }
								creditCard={ card }
								showSecondaryCardCount={ secondaryStoredCards.length > 1 }
								secondaryCardCount={ index + 1 }
							/>
						) ) }
					</div>

					{ showPagination && (
						<Pagination
							className={ classNames( 'payment-method-overview__pagination', {
								'payment-method-overview__pagination--has-prev': page > 1,
								'payment-method-overview__pagination--has-next': isFetching || hasMoreStoredCards,
							} ) }
							pageClick={ onPageClick }
							page={ page }
							perPage={ pageSize }
						/>
					) }
				</PaymentMethodOverviewContext.Provider>
			);
		}

		return <EmptyState />;
	}, [
		hasMoreStoredCards,
		hasStoredCards,
		isFetching,
		onPageClick,
		page,
		pageSize,
		paging,
		primaryStoredCard,
		secondaryStoredCards,
		showPagination,
	] );

	return (
		<Layout className="payment-method-overview" title={ translate( 'Payment Methods' ) } wide>
			<PageViewTracker title="Purchases > Payment Methods" path="/purchases/payment-methods" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ translate( 'Payment Methods' ) } </Title>
					<Subtitle>
						{ translate( "Add a payment method to issue licenses. It's auto-charged monthly." ) }
					</Subtitle>
					<Actions className="a4a-payment-methods__header-actions">
						<MobileSidebarNavigation />

						{ hasStoredCards && (
							<Button href={ A4A_PAYMENT_METHODS_ADD_LINK } onClick={ onAddNewCardClick } primary>
								{ translate( 'Add new card' ) }
							</Button>
						) }
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<p className="a4a-payment-methods__mobile-description">
					{ translate( "Add a payment method to issue licenses. It's auto-charged monthly." ) }
				</p>
				{ content }
			</LayoutBody>
		</Layout>
	);
}
