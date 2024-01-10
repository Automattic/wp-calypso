import { Button, Spinner } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { useDispatch as useWPDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { ReceiptPurchase } from 'calypso/state/receipts/types';

export type ProductPlanProps = {
	siteSlug: string;
	primaryPurchase: ReceiptPurchase;
	siteID: number;
	currency?: string;
};
const ProductPlan = ( { siteSlug, primaryPurchase, siteID }: ProductPlanProps ) => {
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const purchases = useSelector( ( state ) => getSitePurchases( state, siteID ) );
	const productPurchase = useMemo(
		() => getPurchaseByProductSlug( purchases, primaryPurchase.productSlug ),
		[ primaryPurchase.productSlug, purchases ]
	);

	const [ launchPadScreenUpdated, setLaunchPadScreenUpdated ] = useState< boolean >( false );
	const [ redirectTo, setRedirectTo ] = useState< 'home' | 'launchpad' >( 'home' );

	const { saveSiteSettings } = useWPDispatch( SITE_STORE );

	useEffect( () => {
		if ( ! isLoadingPurchases && productPurchase ) {
			setExpirationDate(
				translate( 'Expires on %s', {
					args: moment( productPurchase.expiryDate ).format( 'LL' ),
				} ).toString()
			);
		}
	}, [ isLoadingPurchases, productPurchase ] );

	const { data: launchpad, isLoading } = useLaunchpad( siteSlug, 'intent-build' );

	const hasRemainingTasks =
		launchpad && launchpad.checklist
			? launchpad.checklist.filter(
					( item ) => item?.completed === false && item?.disabled === false
			  ).length > 0
			: false;

	useEffect( () => {
		// when launchpad is off or skipped, we need to update the launchpad_screen option to full
		// otherwise the full screen launchpad will redirect to /home straight away
		if ( launchpad ) {
			if ( launchpad.launchpad_screen !== 'full' ) {
				saveSiteSettings( siteID, { launchpad_screen: 'full' } ).then( () => {
					setLaunchPadScreenUpdated( true );
				} );
			} else if ( launchpad.launchpad_screen === 'full' ) {
				setLaunchPadScreenUpdated( true );
			}
		}

		if ( launchpad && launchpad.is_enabled && hasRemainingTasks ) {
			setRedirectTo( 'launchpad' );
		} else {
			setRedirectTo( 'home' );
		}
	}, [ launchpad ] );

	const letsWorkHref =
		redirectTo === 'launchpad' && hasRemainingTasks && launchPadScreenUpdated
			? `/setup/build/launchpad?siteSlug=${ siteSlug }&showLaunchpad=true`
			: `/home/${ siteSlug }`;

	const letsworkButtonBusy =
		isLoading || ( redirectTo === 'launchpad' && ! launchPadScreenUpdated );

	return (
		<div className="checkout-thank-you__header-details">
			<div className="checkout-thank-you__header-details-content">
				{ isLoadingPurchases ? (
					<Spinner />
				) : (
					<>
						<div className="checkout-thank-you__header-details-content-name">
							{ translate( '%(productName)s plan', {
								args: {
									productName: primaryPurchase.productName,
								},
							} ) }
						</div>
						<div className="checkout-thank-you__header-details-content-expiry">
							{ expirationDate }
						</div>
					</>
				) }
			</div>
			<div className="checkout-thank-you__header-details-buttons">
				<Button busy={ letsworkButtonBusy } primary href={ letsWorkHref }>
					{ translate( 'Let’s work on the site' ) }
				</Button>
				<Button href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Manage plan' ) }</Button>
			</div>
		</div>
	);
};
export default ProductPlan;
