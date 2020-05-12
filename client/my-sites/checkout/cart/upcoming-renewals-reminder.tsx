/**
 * External dependencies
 */
import React, { FunctionComponent, useMemo, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import QueryUserPurchases from 'components/data/query-user-purchases';
import { Button } from '@automattic/components';
import { getRenewalItemFromProduct } from 'lib/cart-values/cart-items';
import SectionHeader from 'components/section-header';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getCurrentUserId } from 'state/current-user/selectors';
import {
	getRenewableSitePurchases,
	hasLoadedUserPurchasesFromServer,
} from 'state/purchases/selectors';
import UpcomingRenewalsDialog from 'me/purchases/upcoming-renewals/upcoming-renewals-dialog';

const OtherPurchasesLink = styled.button`
	background: transparent;
	border: none;
	border-radius: 0;
	padding: 0;
	font-weight: 400;
	font-size: inherit;
	line-height: 1.65;
	text-decoration: underline;
	cursor: pointer;

	&:hover,
	&:focus {
		color: var( --color-link-light );
		box-shadow: none;
	}
`;

export interface CartProduct {
	subscription_id?: string;
	is_renewal: boolean;
}

interface Props {
	cart: {
		hasLoadedFromServer: boolean;
		products: CartProduct[];
	};
	addItemToCart: ( product: object ) => void;
	siteId: number;
	siteUrl: string;
}

const UpcomingRenewalsReminder: FunctionComponent< Props > = ( {
	cart,
	addItemToCart,
	siteId,
	siteUrl,
} ) => {
	const translate = useTranslate();
	const renewableSitePurchases = useSelector( ( state ) =>
		getRenewableSitePurchases( state, siteId )
	);

	const purchasesIdsAlreadyInCart = useMemo(
		() => cart?.products?.map( ( product ) => Number( product.subscription_id ) ),
		[ cart ]
	);

	const purchaseRenewalsNotAlreadyInCart = useMemo(
		() =>
			renewableSitePurchases.filter(
				( purchase ) => ! purchasesIdsAlreadyInCart.includes( purchase.id )
			),
		[ renewableSitePurchases, purchasesIdsAlreadyInCart ]
	);

	const [ isUpcomingRenewalsDialogVisible, setUpcomingRenewalsDialogVisible ] = useState( false );

	const addPurchasesToCart = useCallback(
		( purchases: { meta?: string }[] ) => {
			purchases.forEach( ( purchase ) => {
				const planCartItem = getRenewalItemFromProduct( purchase, { domain: purchase.meta } );
				addItemToCart( planCartItem );
			} );
		},
		[ addItemToCart ]
	);

	const addAllToCart = useCallback( () => {
		addPurchasesToCart( purchaseRenewalsNotAlreadyInCart );
	}, [ addPurchasesToCart, purchaseRenewalsNotAlreadyInCart ] );

	const arePurchasesLoaded = useSelector( ( state ) => hasLoadedUserPurchasesFromServer( state ) );
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );

	if ( ! userId ) {
		return null;
	}

	const shouldRender = arePurchasesLoaded && purchaseRenewalsNotAlreadyInCart.length > 0;

	const translateOptions = {
		args: {
			siteName: siteUrl,
		},
		components: {
			link: (
				<OtherPurchasesLink
					className="cart__upsell-other-upgrades-button"
					onClick={ () => setUpcomingRenewalsDialogVisible( true ) }
				/>
			),
		},
	};

	const message = translate(
		'You have {{link}}other upgrades{{/link}} for %(siteName)s that are available for renewal. Would you like to renew them now?',
		translateOptions
	);

	return (
		<>
			<QueryUserPurchases userId={ userId } />
			{ shouldRender && (
				<div className="cart__upsell-wrapper">
					<UpcomingRenewalsDialog
						isVisible={ isUpcomingRenewalsDialogVisible }
						purchases={ purchaseRenewalsNotAlreadyInCart }
						site={ {
							domain: siteUrl,
							slug: siteUrl,
						} }
						onConfirm={ ( selectedPurchases ) => {
							addPurchasesToCart( selectedPurchases );
							setUpcomingRenewalsDialogVisible( false );
						} }
						onClose={ () => setUpcomingRenewalsDialogVisible( false ) }
						showManagePurchaseLinks={ false }
						submitButtonText={ translate( 'Add to cart' ) }
					/>
					<SectionHeader
						className="cart__header cart__upsell-header"
						label={ translate( 'Renew your products together' ) }
					/>
					<div className="cart__upsell-body">
						<p>{ message }</p>
						<Button onClick={ addAllToCart }>{ translate( 'Renew all' ) }</Button>
					</div>
					<TrackComponentView eventName="calypso_non_dwpo_checkout_plan_upsell_impression" />
				</div>
			) }
		</>
	);
};

export default UpcomingRenewalsReminder;
