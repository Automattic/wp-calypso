import page from '@automattic/calypso-router';
import { Button, Card, FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import { getName, handleRenewMultiplePurchasesClick } from 'calypso/lib/purchases';
import { cancelPurchase, managePurchase } from 'calypso/me/purchases/paths';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

import './style.scss';

interface SiteActionInterstitialProps {
	purchaseId: number;
	siteSlug: string;
	actionType: 'cancel' | 'remove' | 'renew';
	getManagePurchaseUrlFor?: ( siteSlug: string, purchaseId: string | number ) => string;
	getCancelPurchaseUrlFor?: ( siteSlug: string, purchaseId: string | number ) => string;
}

function getVerb( actionType: string, translate: ReturnType< typeof useTranslate > ) {
	if ( actionType === 'renew' ) {
		return translate( 'renew' );
	}
	if ( actionType === 'cancel' ) {
		return translate( 'cancel' );
	}
	return translate( 'remove' );
}

export default function SiteActionInterstitial( {
	purchaseId,
	siteSlug,
	actionType,
	getManagePurchaseUrlFor,
	getCancelPurchaseUrlFor,
}: SiteActionInterstitialProps ) {
	const managePurchaseUrl = getManagePurchaseUrlFor ?? managePurchase;
	const cancelPurchaseUrl = getCancelPurchaseUrlFor ?? cancelPurchase;
	const translate = useTranslate();
	const dispatch = useReduxDispatch();
	const moment = useLocalizedMoment();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const purchases = useSelector( ( state ) =>
		purchase ? getSitePurchases( state, purchase.siteId ) : null
	);
	const hasLoaded = useSelector( hasLoadedUserPurchasesFromServer );

	// For cancel, only show purchases with auto-renew on (cancel = disable
	// auto-renew, so purchases already off have nothing to cancel).
	const eligiblePurchases = purchases?.filter( ( p ) => {
		if ( p.id === purchaseId ) {
			return true;
		}
		if ( actionType === 'cancel' ) {
			return p.isAutoRenewEnabled;
		}
		return true;
	} );

	const [ selectedIds, setSelectedIds ] = useState< Set< number > >(
		() => new Set( [ purchaseId ] )
	);

	// Defer the site card so the grid layout is applied before it appears —
	// prevents a layout shift on cold page loads where CSS arrives after the
	// initial paint.
	const [ showSiteCard, setShowSiteCard ] = useState( false );
	useEffect( () => setShowSiteCard( true ), [] );

	const shouldBypass =
		hasLoaded && ( ! isSplitEnabled || ! eligiblePurchases || eligiblePurchases.length <= 1 );

	// Redirect to the appropriate flow when the interstitial is bypassed
	// (flag off, single eligible purchase, or no purchases).
	useEffect( () => {
		if ( ! shouldBypass ) {
			return;
		}
		if ( ! purchase ) {
			page( managePurchaseUrl( siteSlug, String( purchaseId ) ) );
			return;
		}
		if ( actionType === 'cancel' || actionType === 'remove' ) {
			const intent = actionType;
			const baseUrl = cancelPurchaseUrl( siteSlug, String( purchaseId ) );
			page( `${ baseUrl }?intent=${ intent }` );
		} else {
			dispatch( handleRenewMultiplePurchasesClick( [ purchase ], siteSlug ) );
		}
	}, [
		shouldBypass,
		purchase,
		dispatch,
		siteSlug,
		purchaseId,
		actionType,
		managePurchaseUrl,
		cancelPurchaseUrl,
	] );

	if ( shouldBypass ) {
		return null;
	}

	// Heading and section label only depend on actionType (from URL), safe before data loads
	let heading: string;
	let sectionLabel: string;

	if ( actionType === 'renew' ) {
		heading = translate( 'Renew subscriptions' ) as string;
		sectionLabel = translate( 'Subscriptions' ) as string;
	} else if ( actionType === 'cancel' ) {
		heading = translate( 'Cancel subscriptions' ) as string;
		sectionLabel = translate( 'Subscriptions' ) as string;
	} else {
		heading = translate( 'Remove upgrades' ) as string;
		sectionLabel = translate( 'Upgrades' ) as string;
	}

	// Skeleton loading state while purchases load
	if ( ! hasLoaded || ! purchase || ! eligiblePurchases ) {
		return (
			<>
				<QueryUserPurchases />
				<div className="site-level-actions__back">
					<HeaderCakeBack
						icon="chevron-left"
						href={ managePurchaseUrl( siteSlug, String( purchaseId ) ) }
					/>
				</div>
				<FormattedHeader
					className="site-level-actions__formatted-header"
					headerText={ heading }
					align="left"
					brandFont
				/>
				<p className="site-level-actions__description">
					<span className="site-level-actions__placeholder site-level-actions__placeholder--text" />
				</p>
				<div className="site-level-actions__inner-wrapper">
					<div className="site-level-actions__left">
						<Card className="site-level-actions__wrapper-card">
							<h3 className="site-level-actions__section-title">{ sectionLabel }</h3>
							<div className="site-level-actions__row">
								<span className="site-level-actions__placeholder site-level-actions__placeholder--medium" />
								<span className="site-level-actions__placeholder site-level-actions__placeholder--long" />
							</div>
							<div className="site-level-actions__row">
								<span className="site-level-actions__placeholder site-level-actions__placeholder--medium" />
								<span className="site-level-actions__placeholder site-level-actions__placeholder--long" />
							</div>
						</Card>
					</div>
					{ showSiteCard && (
						<div className="site-level-actions__right">
							<PurchaseSiteHeader isPlaceholder />
						</div>
					) }
				</div>
			</>
		);
	}

	const handleToggle = ( id: number ) => {
		if ( id === purchaseId ) {
			return;
		}
		setSelectedIds( ( prev ) => {
			const next = new Set( prev );
			if ( next.has( id ) ) {
				next.delete( id );
			} else {
				next.add( id );
			}
			return next;
		} );
	};

	const handleContinue = () => {
		const selectedPurchases = eligiblePurchases.filter( ( p ) => selectedIds.has( p.id ) );
		if ( actionType === 'renew' ) {
			dispatch( handleRenewMultiplePurchasesClick( selectedPurchases, siteSlug ) );
			return;
		}
		const intent = actionType;
		const additionalIds = [ ...selectedIds ].filter( ( id ) => id !== purchaseId );
		const baseUrl = cancelPurchaseUrl( siteSlug, String( purchaseId ) );
		const params = new URLSearchParams( { intent } );
		if ( additionalIds.length > 0 ) {
			params.set( 'additionalPurchaseIds', additionalIds.join( ',' ) );
		}
		page( `${ baseUrl }?${ params.toString() }` );
	};

	// Copy variables by action type
	const isRemove = actionType === 'remove';
	const siteName = purchase.domain ?? siteSlug;
	const productName = getName( purchase );
	const noun = isRemove ? translate( 'upgrades' ) : translate( 'subscriptions' );
	const verb = getVerb( actionType, translate );

	let buttonLabel: string;
	let isDestructive = false;

	if ( actionType === 'renew' ) {
		buttonLabel = translate( 'Continue to checkout' ) as string;
	} else if ( actionType === 'cancel' ) {
		buttonLabel = translate( 'Continue to cancel' ) as string;
		isDestructive = true;
	} else {
		buttonLabel = translate( 'Continue to remove' ) as string;
		isDestructive = true;
	}

	const description = translate(
		'Your site %(siteName)s has other %(noun)s. Select any you\u2019d like to %(verb)s along with %(productName)s.',
		{
			args: { siteName, productName, noun, verb },
		}
	) as string;

	const getRenewalText = ( p: Purchase ) => {
		if ( isRemove ) {
			return translate( 'Expires on %(date)s', {
				args: { date: moment( p.expiryDate ).format( 'LL' ) },
			} );
		}
		return translate( 'Renews at %(price)s on %(date)s', {
			args: {
				price: p.priceText,
				date: moment( p.renewDate || p.expiryDate ).format( 'LL' ),
			},
		} );
	};

	return (
		<>
			<QueryUserPurchases />
			<div className="site-level-actions__back">
				<HeaderCakeBack
					icon="chevron-left"
					href={ managePurchaseUrl( siteSlug, String( purchaseId ) ) }
				/>
			</div>
			<FormattedHeader
				className="site-level-actions__formatted-header"
				headerText={ heading }
				align="left"
				brandFont
			/>
			<p className="site-level-actions__description">{ description }</p>
			<div className="site-level-actions__inner-wrapper">
				<div className="site-level-actions__left">
					<Card className="site-level-actions__wrapper-card">
						<h3 className="site-level-actions__section-title">{ sectionLabel }</h3>
						{ eligiblePurchases.map( ( p ) => (
							<div
								key={ p.id }
								className={ clsx( 'site-level-actions__row', {
									'is-selected': selectedIds.has( p.id ),
								} ) }
							>
								<FormLabel className="site-level-actions__label">
									<FormInputCheckbox
										className="site-level-actions__checkbox"
										checked={ selectedIds.has( p.id ) }
										onChange={ () => handleToggle( p.id ) }
										disabled={ p.id === purchaseId }
									/>
									<span className="site-level-actions__name">{ getName( p ) }</span>
								</FormLabel>
								<span className="site-level-actions__renewal-info">{ getRenewalText( p ) }</span>
							</div>
						) ) }
						<div className="site-level-actions__button-row">
							<Button primary scary={ isDestructive } onClick={ handleContinue }>
								{ buttonLabel }
							</Button>
						</div>
					</Card>
				</div>
				{ showSiteCard && (
					<div className="site-level-actions__right">
						<PurchaseSiteHeader
							siteId={ purchase.siteId }
							name={ purchase.siteName }
							purchase={ purchase }
						/>
					</div>
				) }
			</div>
		</>
	);
}
