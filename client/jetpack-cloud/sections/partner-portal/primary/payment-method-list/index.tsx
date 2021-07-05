/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import AddStoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/add-stored-credit-card';
import StoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card';

/**
 * Style dependencies
 */
import './style.scss';

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const cards = storedCards.map( ( card ) => <StoredCreditCard key={ card.card } card={ card } /> );

	return (
		<Main wideLayout className="payment-method-list">
			<QueryStoredCards />
			<DocumentHead title={ translate( 'Payment Method' ) } />
			<SidebarNavigation />

			<div className="payment-method-list__header">
				<CardHeading size={ 36 }>{ translate( 'Payment Method' ) }</CardHeading>
			</div>

			<div className="payment-method-list__body">
				{ cards }
				<AddStoredCreditCard />
			</div>
		</Main>
	);
}
