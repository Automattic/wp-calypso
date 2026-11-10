import { sitePurchasesQuery } from '@automattic/api-queries';
import { isWpComEcommercePlan } from '@automattic/calypso-products';
import { useLaunchpad } from '@automattic/launchpad';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch as useWPDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import type { ReceiptPurchase } from 'calypso/my-sites/checkout/checkout-thank-you/receipt';

export type ThankYouPlanProductProps = {
	purchase: ReceiptPurchase;
	siteSlug: string | null;
	siteId: number | null;
	checkoutType?: string;
};

export default function ThankYouPlanProduct( {
	purchase,
	siteSlug,
	siteId,
	checkoutType,
}: ThankYouPlanProductProps ) {
	const { data: productPurchase, isPending: isLoadingPurchases } = useQuery( {
		...sitePurchasesQuery( siteId ?? 0 ),
		enabled: !! siteId,
		select: ( sitePurchases ) =>
			sitePurchases.find( ( sitePurchase ) => sitePurchase.product_slug === purchase.productSlug ),
	} );

	const expirationDate = productPurchase
		? translate( 'Expires on %s', { args: moment( productPurchase.expiry_date ).format( 'LL' ) } )
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
					if ( siteId && launchpad.launchpad_screen === 'skipped' ) {
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
							variant="primary"
							href={ letsWorkHref }
							onClick={ letsWorkButtonOnClick }
						>
							{ checkoutType === 'unified'
								? translate( 'Go to dashboard' )
								: translate( 'Let’s work on the site' ) }
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
