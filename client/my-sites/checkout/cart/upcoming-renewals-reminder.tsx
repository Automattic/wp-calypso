import { sitePurchasesQuery } from '@automattic/api-queries';
import { isPlan, isDomainRegistration } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { dismissCard } from 'calypso/blocks/dismissible-card/actions';
import { isCardDismissed } from 'calypso/blocks/dismissible-card/selectors';
import SectionHeader from 'calypso/components/section-header';
import { getRelativeDayString } from 'calypso/dashboard/utils/datetime';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getRenewalItemFromProduct } from 'calypso/lib/cart-values/cart-items';
import {
	getName,
	isRenewingBeforeExpiration,
	isExpiredOrRemoved,
	needsToRenewSoon,
} from 'calypso/me/purchases/lib/raw-purchase-helpers';
import UpcomingRenewalsDialog from 'calypso/me/purchases/upcoming-renewals/upcoming-renewals-dialog';
import { PartialCart } from 'calypso/my-sites/checkout/src/components/secondary-cart-promotions';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Purchase } from '@automattic/api-core';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

const URGENT_RENEWAL_WINDOW_IN_DAYS = 10;

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
	cart: PartialCart;
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
}

const UpcomingRenewalsReminder: FunctionComponent< Props > = ( { cart, addItemToCart } ) => {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) as SelectedSite );
	const { data: sitePurchases, isPending: arePurchasesPending } = useQuery( {
		...sitePurchasesQuery( selectedSite?.ID ?? 0 ),
		enabled: Boolean( selectedSite?.ID ),
	} );
	const renewableSitePurchases = useMemo(
		() => ( sitePurchases ?? [] ).filter( needsToRenewSoon ),
		[ sitePurchases ]
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
				( purchase ) => ! purchasesIdsAlreadyInCart.includes( purchase.ID )
			),
		[ renewableSitePurchases, purchasesIdsAlreadyInCart ]
	);

	// Urgent = already expired, or expiring within 10 days. daysUntilExpiry is the
	// server's day count (negative during the post-expiry grace period).
	const urgentPurchases = useMemo(
		() =>
			renewablePurchasesNotAlreadyInCart.filter(
				( purchase ) =>
					purchase.days_until_expiry != null &&
					purchase.days_until_expiry < URGENT_RENEWAL_WINDOW_IN_DAYS
			),
		[ renewablePurchasesNotAlreadyInCart ]
	);

	// Dismissal key for the current set of urgent purchases. Dismissing keeps the
	// modal hidden until the set changes. dismissCard namespaces it under
	// `dismissible-card-`, e.g. `dismissible-card-checkout-urgent-renewals-10-22`.
	const sortedPurchaseIds = urgentPurchases
		.map( ( purchase ) => purchase.ID )
		.sort( ( a, b ) => a - b );
	const dismissPreferenceName = `checkout-urgent-renewals-${ sortedPurchaseIds.join( '-' ) }`;
	const isUrgentSetDismissed = useSelector( isCardDismissed( dismissPreferenceName ) );

	// isCardDismissed reads falsy until preferences load, so the auto-open effect
	// checks this first - otherwise a dismissed modal re-opens (like DismissibleCard).
	const arePreferencesLoaded = useSelector( hasReceivedRemotePreferences );

	const [ isUpcomingRenewalsDialogVisible, setUpcomingRenewalsDialogVisible ] = useState( false );

	// 'urgent' = auto-opened for the urgent subset; 'all' = manual "other upgrades" link.
	const [ dialogVariant, setDialogVariant ] = useState< 'urgent' | 'all' >( 'all' );

	const addPurchasesToCart = useCallback(
		( purchases: Purchase[] ) => {
			purchases.forEach( ( purchase ) => {
				// getRenewalItemFromProduct reads `id` (for extra.purchaseId) and
				// `isRenewable` (for the non-plan, non-domain fallback branch), neither
				// of which the raw purchase spells that way.
				const planCartItem = getRenewalItemFromProduct(
					{ ...purchase, id: purchase.ID, isRenewable: purchase.is_renewable },
					{ domain: purchase.meta }
				);
				addItemToCart( planCartItem );
			} );
		},
		[ addItemToCart ]
	);

	const addSelectedPurchasesToCart = useCallback(
		( purchases: Purchase[] ) => {
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
		( selectedPurchases: Purchase[] ) => {
			addSelectedPurchasesToCart( selectedPurchases );
			setUpcomingRenewalsDialogVisible( false );
		},
		[ addSelectedPurchasesToCart, setUpcomingRenewalsDialogVisible ]
	);

	const onClose = useCallback( () => {
		setUpcomingRenewalsDialogVisible( false );
		if ( dialogVariant === 'urgent' ) {
			reduxDispatch( dismissCard( dismissPreferenceName ) );
			reduxDispatch( recordTracksEvent( 'calypso_checkout_urgent_renewals_modal_dismiss' ) );
		}
	}, [ dialogVariant, dismissPreferenceName, reduxDispatch ] );

	const openAllPurchasesDialog = useCallback( () => {
		setDialogVariant( 'all' );
		setUpcomingRenewalsDialogVisible( true );
	}, [] );

	const arePurchasesLoaded = ! arePurchasesPending;
	const userId = useSelector( getCurrentUserId );

	// Auto-open once per session, when purchases and preferences have loaded,
	// there's an urgent set, and it hasn't already been dismissed.
	const hasAutoOpened = useRef( false );
	useEffect( () => {
		if (
			hasAutoOpened.current ||
			! arePurchasesLoaded ||
			! arePreferencesLoaded ||
			urgentPurchases.length === 0 ||
			isUrgentSetDismissed
		) {
			return;
		}
		hasAutoOpened.current = true;
		setDialogVariant( 'urgent' );
		setUpcomingRenewalsDialogVisible( true );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_urgent_renewals_modal_impression', {
				urgent_count: urgentPurchases.length,
			} )
		);
	}, [
		arePurchasesLoaded,
		arePreferencesLoaded,
		urgentPurchases,
		isUrgentSetDismissed,
		reduxDispatch,
	] );

	if ( ! userId || ! selectedSite ) {
		return null;
	}

	if ( ! arePurchasesLoaded || renewablePurchasesNotAlreadyInCart.length === 0 ) {
		return null;
	}

	const { message, buttonLabel } = getMessages( {
		translate,
		selectedSite,
		setUpcomingRenewalsDialogVisible: openAllPurchasesDialog,
		renewablePurchasesNotAlreadyInCart,
	} );

	const dialogPurchases =
		dialogVariant === 'urgent' ? urgentPurchases : renewablePurchasesNotAlreadyInCart;

	return (
		<div className="cart__upsell-wrapper">
			<UpcomingRenewalsDialog
				isVisible={ isUpcomingRenewalsDialogVisible }
				purchases={ dialogPurchases }
				site={ selectedSite }
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
				<Button onClick={ addAllPurchasesToCart }>{ buttonLabel }</Button>
			</div>
			<TrackComponentView eventName="calypso_checkout_upcoming_renewals_impression" />
		</div>
	);
};

function getMessages( {
	translate,
	selectedSite,
	setUpcomingRenewalsDialogVisible,
	renewablePurchasesNotAlreadyInCart,
}: {
	translate: ReturnType< typeof useTranslate >;
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
	const buttonLabel = translate( 'Add to cart' );
	let message: TranslateResult = '';
	const translateOptions = {
		comment:
			'"expiry" is relative to the present time and it is already localized, eg. "in a year", "a week ago", "today"',
		args: {
			purchaseName: getName( purchase ),
			// This slot feeds both "expired %(expiry)s" and "is expiring %(expiry)s",
			// so it is clamped to match the tense of the branch it lands in.
			expiry: getRelativeDayString(
				new Date( purchase.expiry_date ),
				isExpiredOrRemoved( purchase ) ? 'past' : 'upcoming'
			),
		},
	};

	if ( isExpiredOrRemoved( purchase ) ) {
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
	} else if ( isRenewingBeforeExpiration( purchase ) ) {
		const renewingTranslateOptions = {
			comment:
				'"relativeRenewDate" is relative to the present time and it is already localized, eg. "in a year", "in a month", "today"',
			args: {
				purchaseName: getName( purchase ),
				relativeRenewDate: getRelativeDayString(
					new Date( purchase.renew_date ?? '' ),
					'upcoming'
				),
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
