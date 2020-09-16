/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import PurchasesSite from 'me/purchases/purchases-site/index.jsx';
import {
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'state/purchases/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import NoSitesMessage from 'components/empty-content/no-sites-message';
import { CompactCard } from '@automattic/components';
import EmptyContent from 'components/empty-content';

export default function SubscriptionsContent() {
	const isFetchingPurchases = useSelector( ( state ) => isFetchingUserPurchases( state ) );
	const hasLoadedPurchases = useSelector( ( state ) => hasLoadedUserPurchasesFromServer( state ) );
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSite?.ID ) );
	const translate = useTranslate();

	if ( isFetchingPurchases && ! hasLoadedPurchases ) {
		return <PurchasesSite isPlaceholder />;
	}

	if ( hasLoadedPurchases && ! purchases.length && ! selectedSite?.ID ) {
		return <NoSitesMessage />;
	}

	if ( hasLoadedPurchases && ! purchases.length ) {
		// TODO: add concierge banner
		return (
			<CompactCard className="subscriptions__list--empty">
				<EmptyContent
					title={ translate( 'Looking to upgrade?' ) }
					line={ translate(
						'Our plans give your site the power to thrive. ' + 'Find the plan that works for you.'
					) }
					action={ translate( 'Upgrade now' ) }
					actionURL={ '/plans' }
					illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
				/>
			</CompactCard>
		);
	}

	if ( hasLoadedPurchases && purchases.length && selectedSite?.ID ) {
		// TODO: add concierge banner
		return (
			<PurchasesSite
				showHeader={ false }
				key={ selectedSite.ID }
				siteId={ selectedSite.ID }
				name={ selectedSite.name }
				domain={ selectedSite.domain }
				slug={ selectedSite.slug }
				purchases={ purchases }
			/>
		);
	}

	// TODO: add concierge banner
	return (
		<CompactCard className="subscriptions__list--no-content">
			<EmptyContent
				title={ translate( 'Looking to upgrade?' ) }
				line={ translate(
					'Our plans give your site the power to thrive. Find the plan that works for you.'
				) }
				action={ translate( 'Upgrade now' ) }
				actionURL={ '/plans' }
				illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
			/>
		</CompactCard>
	);
}
