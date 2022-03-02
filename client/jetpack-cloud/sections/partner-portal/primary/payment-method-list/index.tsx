import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Main from 'calypso/components/main';
import AddStoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/add-stored-credit-card';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import StoredCreditCard from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card';
import StoredCreditCardLoading from 'calypso/jetpack-cloud/sections/partner-portal/stored-credit-card/stored-credit-card-loading';
import {
	getAllStoredCards,
	isFetchingStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import './style.scss';

export default function PaymentMethodList(): ReactElement {
	const translate = useTranslate();
	const storedCards = useSelector( getAllStoredCards );
	const isFetching = useSelector( isFetchingStoredCards );
	const cards = storedCards.map( ( card: PaymentMethod ) => (
		<StoredCreditCard key={ card.id } card={ card } />
	) );

	return (
		<Main wideLayout className="payment-method-list">
			<QueryJetpackPartnerPortalStoredCards />
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
		</Main>
	);
}
