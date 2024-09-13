import { isWpComEcommercePlan } from '@automattic/calypso-products';
import { useLaunchpad } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch as useWPDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { ReceiptPurchase } from 'calypso/state/receipts/types';

export type ThankYouPlanProductProps = {
	purchase: ReceiptPurchase;
	siteSlug: string | null;
	siteId: number | null;
	isSecondary?: boolean;
};

export default function ThankYouPlanProduct( {
	purchase,
	siteSlug,
	siteId,
	isSecondary,
}: ThankYouPlanProductProps ) {
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);

	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const productPurchase = useMemo(
		() => getPurchaseByProductSlug( purchases, purchase.productSlug ),
		[ purchase.productSlug, purchases ]
	);

	const expirationDate =
		! isLoadingPurchases && productPurchase
			? translate( 'Expires on %s', { args: moment( productPurchase.expiryDate ).format( 'LL' ) } )
			: '';

	const [ letsWorkButtonBusy, setLetsWorkButtonBusy ] = useState< boolean >( false );
	const [ redirectTo, setRedirectTo ] = useState< 'home' | 'launchpad' >( 'home' );

	const { saveSiteSettings } = useWPDispatch( SITE_STORE );

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
	}, [ launchpad, hasRemainingTasks ] );

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
						await saveSiteSettings( siteId, { launchpad_screen: 'full' } );
					}
					setLetsWorkButtonBusy( false );
					window.location.assign( letsWorkHref );
				};

				redirect();
			}
		},
		[ launchpad.launchpad_screen, letsWorkHref, redirectTo, saveSiteSettings, siteId ]
	);

	return (
		<ThankYouProduct
			name={ translate( '%(productName)s plan', {
				args: {
					productName: purchase.productName,
				},
			} ) }
			key={ 'plan-' + purchase.productSlug }
			details={ expirationDate }
			actions={
				<>
					{ ! isWpComEcommercePlan( purchase.productSlug ) && (
						<Button
							isBusy={ letsWorkButtonBusy }
							variant={ isSecondary ? 'secondary' : 'primary' }
							href={ letsWorkHref }
							onClick={ letsWorkButtonOnClick }
						>
							{ translate( 'Let’s work on the site' ) }
						</Button>
					) }
					<Button variant="secondary" href={ `/plans/my-plan/${ siteSlug }` }>
						{ translate( 'Manage plan' ) }
					</Button>
				</>
			}
			isLoading={ isLoadingPurchases }
		/>
	);
}
