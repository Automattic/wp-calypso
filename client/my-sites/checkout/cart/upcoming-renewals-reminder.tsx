/**
 * External dependencies
 */
import React, { FunctionComponent, useMemo, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';
import type { RequestCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { ReduxDispatch } from 'calypso/state/redux-store';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { Button } from '@automattic/components';
import { getRenewalItemFromProduct } from 'calypso/lib/cart-values/cart-items';
import { getName, isExpired, isRenewing } from 'calypso/lib/purchases';
import { isPlan, isDomainRegistration } from '@automattic/calypso-products';
import SectionHeader from 'calypso/components/section-header';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	getRenewableSitePurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import UpcomingRenewalsDialog from 'calypso/me/purchases/upcoming-renewals/upcoming-renewals-dialog';
import type { Purchase } from 'calypso/lib/purchases/types';
import { MockResponseCart } from 'calypso/my-sites/checkout/composite-checkout/components/secondary-cart-promotions';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

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

interface SelectedSite {
	ID: number;
	domain: string;
	slug: string;
}

interface Props {
	cart: MockResponseCart;
	addItemToCart: ( product: RequestCartProduct ) => void;
}

const UpcomingRenewalsReminder: FunctionComponent< Props > = ( { cart, addItemToCart } ) => {
	const reduxDispatch = useDispatch< ReduxDispatch >();
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) as SelectedSite );
	const renewableSitePurchases: Purchase[] = useSelector( ( state ) =>
		getRenewableSitePurchases( state, selectedSite?.ID )
	);

	const purchasesIdsAlreadyInCart = useMemo(
		() =>
			( cart.products || [] )
				.map( ( product ) =>
					product.subscription_id ? Number( product.subscription_id ) : null
				)
				.filter( ( purchaseId ) => purchaseId !== null ),
		[ cart ]
	);

	const renewablePurchasesNotAlreadyInCart = useMemo(
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
					available: renewablePurchasesNotAlreadyInCart.length,
				} )
			);
			addPurchasesToCart( purchases );
		},
		[ addPurchasesToCart, reduxDispatch, renewablePurchasesNotAlreadyInCart ]
	);

	const addAllPurchasesToCart = useCallback( () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_upcoming_renewals_add_all_click', {
				available: renewablePurchasesNotAlreadyInCart.length,
			} )
		);
		addPurchasesToCart( renewablePurchasesNotAlreadyInCart );
	}, [ addPurchasesToCart, reduxDispatch, renewablePurchasesNotAlreadyInCart ] );

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

	if ( ! userId || ! selectedSite ) {
		return null;
	}

	const shouldRender = arePurchasesLoaded && renewablePurchasesNotAlreadyInCart.length > 0;

	const { message, buttonLabel } = getMessages( {
		translate,
		moment,
		selectedSite,
		setUpcomingRenewalsDialogVisible,
		renewablePurchasesNotAlreadyInCart,
	} );

	return (
		<>
			<QueryUserPurchases userId={ userId } />
			{ shouldRender && (
				<div className="cart__upsell-wrapper">
					<UpcomingRenewalsDialog
						isVisible={ isUpcomingRenewalsDialogVisible }
						purchases={ renewablePurchasesNotAlreadyInCart }
						site={ selectedSite }
						onConfirm={ onConfirm }
						onClose={ onClose }
						showManagePurchaseLinks={ false }
						submitButtonText={ translate( 'Add to Cart' ) }
					/>
					<SectionHeader
						className="cart__header cart__upsell-header"
						label={ translate( 'Renew your products together' ) }
					/>
					<div className="cart__upsell-body">
						<p>{ message }</p>
						<Button onClick={ addAllPurchasesToCart }>{ buttonLabel }</Button>
					</div>
					<TrackComponentView eventName="calypso_checkout_upcoming_renewals_impression" />
				</div>
			) }
		</>
	);
};

function getMessages( {
	translate,
	moment,
	selectedSite,
	setUpcomingRenewalsDialogVisible,
	renewablePurchasesNotAlreadyInCart,
}: {
	translate: ReturnType< typeof useTranslate >;
	moment: ReturnType< typeof useLocalizedMoment >;
	selectedSite: SelectedSite;
	setUpcomingRenewalsDialogVisible: ( isVisible: boolean ) => void;
	renewablePurchasesNotAlreadyInCart: Purchase[];
} ) {
	if ( renewablePurchasesNotAlreadyInCart.length === 0 ) {
		return { message: '', buttonLabel: '' };
	}
	if ( renewablePurchasesNotAlreadyInCart.length > 1 ) {
		const translateOptions = {
			args: {
				siteName: selectedSite.domain,
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

		const buttonLabel = translate( 'Renew all' );

		return {
			message,
			buttonLabel,
		};
	}

	const purchase = renewablePurchasesNotAlreadyInCart[ 0 ];
	const buttonLabel = translate( 'Add to Cart' );
	let message: ReturnType< typeof translate > = '';
	const translateOptions = {
		comment:
			'"expiry" is relative to the present time and it is already localized, eg. "in a year", "in a month", "a week ago"',
		args: {
			purchaseName: getName( purchase ),
			expiry: moment( purchase.expiryDate ).fromNow(),
		},
	};

	if ( isExpired( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			message = translate(
				'Your %(purchaseName)s domain expired %(expiry)s. Would you like to renew it now?',
				translateOptions
			);
		} else if ( isPlan( purchase ) ) {
			message = translate(
				'Your %(purchaseName)s plan expired %(expiry)s. Would you like to renew it now?',
				translateOptions
			);
		} else {
			message = translate(
				'Your %(purchaseName)s subscription expired %(expiry)s. Would you like to renew it now?',
				translateOptions
			);
		}
	} else if ( isRenewing( purchase ) ) {
		const renewingTranslateOptions = {
			comment:
				'"relativeRenewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month"',
			args: {
				purchaseName: getName( purchase ),
				relativeRenewDate: moment( purchase.renewDate ).fromNow(),
			},
		};
		if ( isDomainRegistration( purchase ) ) {
			message = translate(
				'Your %(purchaseName)s domain is renewing %(relativeRenewDate)s. Would you like to renew it now?',
				renewingTranslateOptions
			);
		} else if ( isPlan( purchase ) ) {
			message = translate(
				'Your %(purchaseName)s plan is renewing %(relativeRenewDate)s. Would you like to renew it now?',
				renewingTranslateOptions
			);
		} else {
			message = translate(
				'Your %(purchaseName)s subscription is renewing %(relativeRenewDate)s. Would you like to renew it now?',
				renewingTranslateOptions
			);
		}
	} else if ( isDomainRegistration( purchase ) ) {
		message = translate(
			'Your %(purchaseName)s domain is expiring %(expiry)s. Would you like to renew it now?',
			translateOptions
		);
	} else if ( isPlan( purchase ) ) {
		message = translate(
			'Your %(purchaseName)s plan is expiring %(expiry)s. Would you like to renew it now?',
			translateOptions
		);
	} else {
		message = translate(
			'Your %(purchaseName)s subscription is expiring %(expiry)s. Would you like to renew it now?',
			translateOptions
		);
	}

	return {
		message,
		buttonLabel,
	};
}

export default UpcomingRenewalsReminder;
