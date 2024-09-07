import { formatCurrency } from '@automattic/format-currency';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
import { navigate } from 'calypso/lib/navigate';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	TYPE_TIER,
} from 'calypso/my-sites/earn/memberships/constants';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { StepProps } from '../../types';
import StartImportButton from './../start-import-button';
import { MapPlan, TierToAdd } from './map-plan';

function formatCurrencyFloat( amount: number, currency: string ) {
	const formattedCurrency = formatCurrency( amount, currency, {
		isSmallestUnit: true,
	} ).replace( /[^\d.-]/g, '' );
	return parseFloat( formattedCurrency );
}

function shouldShowButton( cardData: any ) {
	// Show the button if
	if ( ! cardData?.is_connected_stripe ) {
		return true;
	}

	// show the button if we have mapped all the
	const plans = cardData?.plans ?? [];
	const map_plans = cardData?.map_plans ?? {};

	// Check if all items in the map array have a value for each key
	return Object.values( plans ).every(
		( item: any ) => map_plans[ item?.product_id ] !== undefined
	);
}

export default function MapPlans( {
	cardData,
	selectedSite,
	engine,
	siteSlug,
	fromSite,
}: StepProps ) {
	const [ productToAdd, setProductToAdd ] = useState< TierToAdd | null >( null );

	const queryClient = useQueryClient();

	const closeDialog = () => {
		setProductToAdd( null );
	};

	const products = useSelector( ( state ) => getProductsForSiteId( state, selectedSite.ID ) );
	const sizeOfProductsRef = useRef( products.length );

	const sizeOfProducts = products.length;
	// check if we added new products and if so invalidate the query to check it again.
	useEffect( () => {
		if ( sizeOfProducts === sizeOfProductsRef.current || sizeOfProducts === 0 ) {
			return;
		}
		sizeOfProductsRef.current = sizeOfProducts;
		queryClient.invalidateQueries( {
			queryKey: [ 'paid-newsletter-importer', selectedSite.ID, engine ],
		} );
	}, [ sizeOfProducts, sizeOfProductsRef, selectedSite.ID, engine, queryClient ] );

	const monthyPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'month' );
	const annualPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'year' );

	// TODO what if those plans are undefined?
	if ( ! monthyPlan || ! annualPlan ) {
		return;
	}

	const tierToAdd = {
		currency: monthyPlan.plan_currency,
		price: formatCurrencyFloat( monthyPlan.plan_amount_decimal, monthyPlan.plan_currency ),
		type: TYPE_TIER,
		title: 'Newsletter tier',
		interval: PLAN_MONTHLY_FREQUENCY,
		annualProduct: {
			currency: annualPlan.plan_currency,
			price: formatCurrencyFloat( annualPlan.plan_amount_decimal, annualPlan.plan_currency ),
			type: TYPE_TIER,
			interval: PLAN_YEARLY_FREQUENCY,
		},
	};

	const showButton = shouldShowButton( cardData );

	return (
		<>
			<h2>Paid newsletter offering</h2>
			<p>
				<strong>
					Review the plans retieved from Stripe and create euqivalent plans in WordPress.com
				</strong>{ ' ' }
				to prevent disruption to your current paid subscribers.
			</p>
			<div className="map-plans__mapping">
				<p>
					<strong>Existing Stripe plans</strong>
				</p>
				{ cardData.plans.map( ( plan: any ) => (
					<MapPlan
						key={ plan.plan_id }
						siteId={ selectedSite.ID }
						engine={ engine }
						currentStep="subscribers"
						plan={ plan }
						products={ cardData.available_tiers }
						map_plans={ cardData.map_plans }
						onProductAdd={ setProductToAdd }
						tierToAdd={ tierToAdd }
					/>
				) ) }
			</div>

			{ showButton && (
				<StartImportButton
					engine={ engine }
					siteId={ selectedSite.ID }
					hasPaidSubscribers
					step="subscribers"
					navigate={ () => {
						navigate( `/import/newsletter/${ engine }/${ siteSlug }/summary?from=${ fromSite }` );
					} }
				/>
			) }
			{ ! showButton && <p>Map plans on WordPress.com to continue...</p> }

			{ productToAdd && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ productToAdd }
					annualProduct={ productToAdd.annualProduct }
					isOnlyTier
					hideWelcomeEmailInput
					hideAdvancedSettings
				/>
			) }
		</>
	);
}
