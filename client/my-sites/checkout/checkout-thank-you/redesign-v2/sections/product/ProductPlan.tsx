import { Button, Spinner } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { useDispatch as useWPDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

	const [ letsWorkButtonBusy, setLetsWorkButtonBusy ] = useState< boolean >( false );
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
		if (
			launchpad &&
			launchpad.is_enabled &&
			hasRemainingTasks &&
			launchpad.launchpad_screen !== 'off'
		) {
			setRedirectTo( 'launchpad' );
		} else {
			setRedirectTo( 'home' );
		}
	}, [ launchpad ] );

	useEffect( () => {
		setLetsWorkButtonBusy( isLoading );
	}, [ isLoading ] );

	const letsWorkHref =
		redirectTo === 'launchpad' && hasRemainingTasks
			? `/setup/build/launchpad?siteSlug=${ siteSlug }&showLaunchpad=true`
			: `/home/${ siteSlug }`;

	const letsWorkButtonOnClick = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			if ( redirectTo === 'launchpad' ) {
				e.preventDefault();
				setLetsWorkButtonBusy( true );

				const redirect = async () => {
					if ( launchpad.launchpad_screen === 'skipped' ) {
						await saveSiteSettings( siteID, { launchpad_screen: 'full' } );
					}
					setLetsWorkButtonBusy( false );
					window.location.assign( letsWorkHref );
				};

				redirect();
			}
		},
		[ launchpad, letsWorkHref, redirectTo ]
	);

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
				<Button
					busy={ letsWorkButtonBusy }
					primary
					href={ letsWorkHref }
					onClick={ letsWorkButtonOnClick }
				>
					{ translate( 'Let’s work on the site' ) }
				</Button>
				<Button href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Manage plan' ) }</Button>
			</div>
		</div>
	);
};
export default ProductPlan;
