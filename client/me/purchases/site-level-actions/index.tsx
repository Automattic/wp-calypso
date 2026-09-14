import { purchaseQuery, sitePurchasesQuery } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { Button, Card, FormLabel } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import { handleRenewMultiplePurchasesClick } from 'calypso/lib/purchases';
import { cancelPurchase, managePurchase } from 'calypso/me/purchases/paths';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { getName } from '../lib/raw-purchase-helpers';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

interface SiteActionInterstitialProps {
	purchaseId: number;
	siteSlug: string;
	actionType: 'cancel' | 'remove' | 'renew';
}

export default function SiteActionInterstitial( {
	purchaseId,
	siteSlug,
	actionType,
}: SiteActionInterstitialProps ) {
	const translate = useTranslate();
	const dispatch = useReduxDispatch();
	const moment = useLocalizedMoment();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();

	const { data: purchase, isPending: isPendingPurchase } = useQuery( purchaseQuery( purchaseId ) );
	const siteId = purchase ? Number( purchase.blog_id ) : undefined;
	const { data: purchases, isPending: isPendingSitePurchases } = useQuery( {
		...sitePurchasesQuery( siteId as number ),
		enabled: Boolean( siteId ),
	} );
	// A disabled query stays `pending` forever, so only wait on the site
	// purchases once there is a site to fetch them for. Otherwise a purchase
	// that fails to load would leave this stuck on the skeleton instead of
	// falling through to the redirect below.
	const hasLoaded = ! isPendingPurchase && ( ! siteId || ! isPendingSitePurchases );

	const [ selectedIds, setSelectedIds ] = useState< Set< number > >(
		() => new Set( [ purchaseId ] )
	);

	const shouldBypass = hasLoaded && ( ! isSplitEnabled || ! purchases || purchases.length <= 1 );

	// Redirect to normal renew flow when flag is off or site has only one purchase
	useEffect( () => {
		if ( ! shouldBypass ) {
			return;
		}
		if ( purchase ) {
			dispatch( handleRenewMultiplePurchasesClick( [ purchase ], siteSlug ) );
		} else {
			page( managePurchase( siteSlug, String( purchaseId ) ) );
		}
	}, [ shouldBypass, purchase, dispatch, siteSlug, purchaseId ] );

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
	if ( ! hasLoaded || ! purchase || ! purchases ) {
		return (
			<>
				<div className="site-level-actions__back">
					<HeaderCakeBack
						icon="chevron-left"
						href={ managePurchase( siteSlug, String( purchaseId ) ) }
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
					<div className="site-level-actions__right">
						<PurchaseSiteHeader isPlaceholder />
					</div>
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
		const selectedPurchases = purchases.filter( ( p ) => selectedIds.has( Number( p.ID ) ) );
		if ( actionType === 'renew' ) {
			dispatch( handleRenewMultiplePurchasesClick( selectedPurchases, siteSlug ) );
			return;
		}
		const intent = actionType;
		const additionalIds = [ ...selectedIds ].filter( ( id ) => id !== purchaseId );
		const baseUrl = cancelPurchase( siteSlug, String( purchaseId ) );
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

	let description: string;
	if ( actionType === 'renew' ) {
		description = translate(
			'Your site %(siteName)s has other subscriptions. Select any you\u2019d like to renew along with %(productName)s.',
			{ args: { siteName, productName } }
		) as string;
	} else if ( actionType === 'cancel' ) {
		description = translate(
			'Your site %(siteName)s has other subscriptions. Select any you\u2019d like to cancel along with %(productName)s.',
			{ args: { siteName, productName } }
		) as string;
	} else {
		description = translate(
			'Your site %(siteName)s has other upgrades. Select any you\u2019d like to remove along with %(productName)s.',
			{ args: { siteName, productName } }
		) as string;
	}

	const getRenewalText = ( p: Purchase ) => {
		if ( isRemove ) {
			if ( p.is_past_expiry_date ) {
				return translate( 'Expired on %(date)s', {
					args: { date: moment( p.expiry_date ).format( 'LL' ) },
				} );
			}
			return translate( 'Expires on %(date)s', {
				args: { date: moment( p.expiry_date ).format( 'LL' ) },
			} );
		}
		const expiryDate = p.expiry_date ? moment( p.expiry_date ).format( 'LL' ) : null;
		// Once the expiry date has passed, lead with the expiry status rather
		// than any scheduled auto-renewal date. During the grace period the UI
		// should steer toward manual renewal — a remaining auto-renewal attempt
		// is unlikely to succeed — so show "Expired on" even if `renewDate` is
		// still set.
		if ( p.is_past_expiry_date && expiryDate ) {
			return translate( 'Renews at %(price)s. Expired on %(date)s', {
				args: { price: p.price_text, date: expiryDate },
			} );
		}
		// An upcoming scheduled renewal: show its date. `renewDate` is only
		// populated when there is an upcoming auto-renewal, so an empty value
		// means "not renewing".
		if ( p.renew_date ) {
			return translate( 'Renews at %(price)s on %(date)s', {
				args: {
					price: p.price_text,
					date: moment( p.renew_date ).format( 'LL' ),
				},
			} );
		}
		// Not yet expired and not renewing: show the upcoming expiry date.
		if ( expiryDate ) {
			return translate( 'Renews at %(price)s. Expires on %(date)s', {
				args: { price: p.price_text, date: expiryDate },
			} );
		}
		// One-time/perpetual purchase (no renewal, no expiry): no subtitle.
		return '';
	};

	return (
		<>
			<div className="site-level-actions__back">
				<HeaderCakeBack
					icon="chevron-left"
					href={ managePurchase( siteSlug, String( purchaseId ) ) }
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
						{ purchases.map( ( p ) => (
							<div
								key={ p.ID }
								className={ clsx( 'site-level-actions__row', {
									'is-selected': selectedIds.has( Number( p.ID ) ),
								} ) }
							>
								<FormLabel className="site-level-actions__label">
									<FormInputCheckbox
										className="site-level-actions__checkbox"
										checked={ selectedIds.has( Number( p.ID ) ) }
										onChange={ () => handleToggle( Number( p.ID ) ) }
										disabled={ Number( p.ID ) === purchaseId }
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
				<div className="site-level-actions__right">
					<PurchaseSiteHeader siteId={ siteId } name={ purchase.blogname } purchase={ purchase } />
				</div>
			</div>
		</>
	);
}
