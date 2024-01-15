import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import { useSelector } from 'calypso/state';
import {
	getAllStoredCards,
	isFetchingStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import StoredCreditCardV2 from '../stored-credit-card-v2';
import EmptyState from './empty-state';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

export default function PaymentMethodListV2() {
	const translate = useTranslate();

	const storedCards = useSelector( getAllStoredCards );
	const isFetching = useSelector( isFetchingStoredCards );

	const title = translate( 'Payment Methods' );
	const subtitle = translate(
		"Add a payment method to issue licenses. It's auto-charged monthly."
	);

	const [ paging ] = useState( { startingAfter: '', endingBefore: '' } ); // TODO: Implement pagination.

	const primaryCard = storedCards.find( ( card ) => card.is_default );
	const secondaryCards = storedCards.filter( ( card ) => ! card.is_default );

	const getBody = () => {
		if ( isFetching ) {
			return 'Loading...';
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

	return (
		<Layout className="payment-method-list-v2" title={ title } wide>
			<QueryJetpackPartnerPortalStoredCards paging={ paging } />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					<Subtitle>{ subtitle }</Subtitle>
					<Actions>
						<Button href="/partner-portal/payment-methods/add" primary>
							{ translate( 'Add new card' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ getBody() }</LayoutBody>
		</Layout>
	);
}
