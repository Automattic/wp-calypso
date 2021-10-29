import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryStoredCards from 'calypso/components/data/query-stored-cards';
import Main from 'calypso/components/main';
import AddStoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/add-stored-credit-card';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import StoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
import './style.scss';

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const cards = storedCards.map( ( card ) => (
		<StoredCreditCard key={ card.stored_details_id } card={ card } />
	) );

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
