/**
 * External dependencies
 */
import React, { FunctionComponent, useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { ReduxDispatch } from 'state/redux-store';
import { recordTracksEvent } from 'state/analytics/actions';
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
import UpcomingRenewalsDialog, {
	Purchase,
} from 'me/purchases/upcoming-renewals/upcoming-renewals-dialog';

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
	const reduxDispatch = useDispatch< ReduxDispatch >();
	const translate = useTranslate();
	const renewableSitePurchases: Purchase[] = useSelector( ( state ) =>
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
		( purchases: Purchase[] ) => {
			purchases.forEach( ( purchase ) => {
				const planCartItem = getRenewalItemFromProduct( purchase, { domain: purchase.meta } );
				addItemToCart( planCartItem );
			} );
		},
		[ addItemToCart ]
	);

	const addSelectedPurchasesToCart = useCallback(
		( purchases ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_upcoming_renewals_dialog_submit', {
					selected: purchases.length,
					available: purchaseRenewalsNotAlreadyInCart.length,
				} )
			);
			addPurchasesToCart( purchases );
		},
		[ addPurchasesToCart, reduxDispatch, purchaseRenewalsNotAlreadyInCart ]
	);

	const addAllPurchasesToCart = useCallback( () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_upcoming_renewals_add_all_click', {
				available: purchaseRenewalsNotAlreadyInCart.length,
			} )
		);
		addPurchasesToCart( purchaseRenewalsNotAlreadyInCart );
	}, [ addPurchasesToCart, reduxDispatch, purchaseRenewalsNotAlreadyInCart ] );

	const onConfirm = useCallback(
		( selectedPurchases ) => {
			addSelectedPurchasesToCart( selectedPurchases );
			setUpcomingRenewalsDialogVisible( false );
		},
		[ addSelectedPurchasesToCart, setUpcomingRenewalsDialogVisible ]
	);

	const onClose = useCallback( () => {
		setUpcomingRenewalsDialogVisible( false );
	}, [ setUpcomingRenewalsDialogVisible ] );

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
						onConfirm={ onConfirm }
						onClose={ onClose }
						showManagePurchaseLinks={ false }
						submitButtonText={ translate( 'Add to cart' ) }
					/>
					<SectionHeader
						className="cart__header cart__upsell-header"
						label={ translate( 'Renew your products together' ) }
					/>
					<div className="cart__upsell-body">
						<p>{ message }</p>
						<Button onClick={ addAllPurchasesToCart }>{ translate( 'Renew all' ) }</Button>
					</div>
					<TrackComponentView eventName="calypso_checkout_upcoming_renewals_impression" />
				</div>
			) }
		</>
	);
};

export default UpcomingRenewalsReminder;
