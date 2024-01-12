import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import QueryJetpackPartnerPortalStoredCards from 'calypso/components/data/query-jetpack-partner-portal-stored-cards';
import Layout from 'calypso/jetpack-cloud/components/layout';
import LayoutBody from 'calypso/jetpack-cloud/components/layout/body';
import LayoutHeader, {
	LayoutHeaderSubtitle as Subtitle,
	LayoutHeaderTitle as Title,
} from 'calypso/jetpack-cloud/components/layout/header';
import LayoutTop from 'calypso/jetpack-cloud/components/layout/top';
import { useSelector } from 'calypso/state';
import {
	getAllStoredCards,
	isFetchingStoredCards,
} from 'calypso/state/partner-portal/stored-cards/selectors';
import EmptyState from './empty-state';

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

	const getBody = () => {
		if ( isFetching ) {
			// TODO: Show loading state.
		}

		if ( storedCards.length ) {
			// TODO: Show list of cards and implement pagination.
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
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ getBody() }</LayoutBody>
		</Layout>
	);
}
