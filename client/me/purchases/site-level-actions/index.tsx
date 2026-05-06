import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { useIsSplitCancelRemoveEnabled } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/use-is-split-cancel-remove-enabled';
import { getName, handleRenewMultiplePurchasesClick } from 'calypso/lib/purchases';
import { cancelPurchase, managePurchase } from 'calypso/me/purchases/paths';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import {
	getByPurchaseId,
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
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
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();

	const purchase = useSelector( ( state ) => getByPurchaseId( state, purchaseId ) );
	const purchases = useSelector( ( state ) =>
		purchase ? getSitePurchases( state, purchase.siteId ) : null
	);
	const hasLoaded = useSelector( hasLoadedUserPurchasesFromServer );

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

	const handleToggle = ( id: number ) => {
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
		if ( ! purchases ) {
			return;
		}
		const selectedPurchases = purchases.filter( ( p ) => selectedIds.has( p.id ) );
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

	let heading: string;
	let description: string;
	let buttonLabel: string;

	if ( actionType === 'renew' ) {
		heading = translate( 'Renew additional upgrades?' ) as string;
		description = translate(
			'Your site %(siteName)s has other upgrades. Select any you’d like to renew along with %(productName)s.',
			{
				args: {
					siteName: purchase?.domain ?? siteSlug,
					productName: purchase ? getName( purchase ) : '',
				},
			}
		) as string;
		buttonLabel = translate( 'Continue to checkout' ) as string;
	} else if ( actionType === 'cancel' ) {
		heading = translate( 'Review upgrades on %(siteName)s', {
			args: { siteName: purchase?.domain ?? siteSlug },
		} ) as string;
		description = translate(
			'You’re canceling %(productName)s. This site has other upgrades that may continue to renew. Select any you’d like to cancel too.',
			{ args: { productName: purchase ? getName( purchase ) : '' } }
		) as string;
		buttonLabel = translate( 'Continue cancellation' ) as string;
	} else {
		heading = translate( 'Review upgrades on %(siteName)s', {
			args: { siteName: purchase?.domain ?? siteSlug },
		} ) as string;
		description = translate(
			'You’re removing %(productName)s. This site has other upgrades you may no longer need. Select any you’d like to remove too.',
			{ args: { productName: purchase ? getName( purchase ) : '' } }
		) as string;
		buttonLabel = translate( 'Continue removal' ) as string;
	}

	return (
		<>
			<QueryUserPurchases />
			<Card className="site-level-actions__wrapper-card">
				<HeaderCakeBack href={ managePurchase( siteSlug, String( purchaseId ) ) } />
				<FormattedHeader headerText={ heading } align="left" brandFont />
				<p className="site-level-actions__description">{ description }</p>
				<div className="site-level-actions__purchase-list">
					{ ( purchases ?? [] ).map( ( p ) => (
						<label key={ p.id } className="site-level-actions__purchase-item">
							<FormCheckbox
								checked={ selectedIds.has( p.id ) }
								onChange={ () => handleToggle( p.id ) }
								disabled={ p.id === purchaseId }
							/>
							<span className="site-level-actions__purchase-name">{ getName( p ) }</span>
							<span className="site-level-actions__purchase-price">{ p.priceText }</span>
						</label>
					) ) }
				</div>
				<Button primary onClick={ handleContinue } className="site-level-actions__continue-button">
					{ buttonLabel }
				</Button>
			</Card>
		</>
	);
}
