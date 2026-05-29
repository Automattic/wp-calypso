import { formatCurrency } from '@automattic/number-formatters';
import { useQueryClient } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState, useRef } from 'react';
import { useMapStripePlanToProductMutation } from 'calypso/data/paid-newsletter/use-map-stripe-plan-to-product-mutation';
import { useSetCompPlanMutation } from 'calypso/data/paid-newsletter/use-set-comp-plan-mutation';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	TYPE_TIER,
} from 'calypso/my-sites/earn/memberships/constants';
import { Product } from 'calypso/my-sites/earn/types';
import { useSelector } from 'calypso/state';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { SubscribersStepProps } from '../../types';
import StartImportButton from './../start-import-button';
import { MapCompPlan } from './map-comp-plan';
import { MapPlan, TierToAdd } from './map-plan';
import NoPlans from './no-plans';
import SuccessNotice from './success-notice';

function formatCurrencyFloat( amount: number, currency: string ) {
	const formattedCurrency = formatCurrency( amount, currency, {
		isSmallestUnit: true,
	} ).replace( /[^\d.-]/g, '' );
	return parseFloat( formattedCurrency );
}

function shouldEnableImporting( cardData: any ) {
	// Enable the button if
	if ( ! cardData?.is_connected_stripe ) {
		return true;
	}

	// Enable the button if we have mapped all the
	const plans = cardData?.plans ?? [];
	const map_plans = cardData?.map_plans ?? {};

	const allPlansMapped = Object.values( plans ).every(
		( item: any ) => map_plans[ item?.product_id ] !== undefined
	);
	if ( ! allPlansMapped ) {
		return false;
	}

	// If there are comped subscribers, require a comp plan selection that still
	// resolves to a known Stripe plan (guards against stale selections after a
	// Stripe account reconnect or plan deletion).
	const compCount = parseInt( cardData?.meta?.comp_count || '0' );
	if ( compCount > 0 ) {
		const compStripePlanId = cardData?.comp_stripe_plan_id;
		if ( ! compStripePlanId ) {
			return false;
		}
		const compPlanExists = ( plans as any[] ).some(
			( item: any ) => item?.product_id === compStripePlanId
		);
		if ( ! compPlanExists ) {
			return false;
		}
	}

	return true;
}

function findNewProduct( currentProducts: Array< Product >, previousProducts: Array< Product > ) {
	if ( ! previousProducts ) {
		return currentProducts[ 0 ];
	}
	return currentProducts.find(
		( product ) => ! previousProducts.some( ( prevProduct ) => prevProduct.ID === product.ID )
	);
}

interface MapPlansProps extends Omit< SubscribersStepProps, 'fromSite' > {
	onStartImport: () => void;
}

export default function MapPlans( {
	cardData,
	selectedSite,
	engine,
	siteSlug,
	onStartImport,
}: MapPlansProps ) {
	const { __ } = useI18n();
	const [ productToAdd, setProductToAdd ] = useState< TierToAdd | null >( null );

	const currentStep = 'subscribers';

	const queryClient = useQueryClient();

	const newsletterTiers = useSelector( ( state ) =>
		getProductsForSiteId( state, selectedSite.ID )
	);
	const { mapStripePlanToProduct, isPending: isSavingPlanMapping } =
		useMapStripePlanToProductMutation();
	const { setCompPlan, isPending: isSavingCompPlan } = useSetCompPlanMutation();
	const newsletterTiersRef = useRef( newsletterTiers );
	const stripePlanRef = useRef( '' );

	const closeDialog = () => {
		setProductToAdd( null );
	};

	// check if we added new products and if so invalidate the query to check it again.
	useEffect( () => {
		if (
			newsletterTiers.length === newsletterTiersRef.current.length ||
			newsletterTiers.length === 0
		) {
			return;
		}
		const newlyAddedNewsletterTier = findNewProduct( newsletterTiers, newsletterTiersRef.current );
		newsletterTiersRef.current = newsletterTiers;

		if ( newlyAddedNewsletterTier ) {
			const stripePlan = cardData.plans.find(
				( plan: any ) => plan.product_id === stripePlanRef.current
			);

			if (
				stripePlan &&
				newlyAddedNewsletterTier?.renewal_schedule === '1 ' + stripePlan.plan_interval &&
				newlyAddedNewsletterTier?.ID
			) {
				mapStripePlanToProduct(
					selectedSite.ID,
					engine,
					currentStep,
					stripePlanRef.current,
					newlyAddedNewsletterTier.ID.toString()
				);
			}
		}
	}, [
		newsletterTiersRef,
		selectedSite.ID,
		engine,
		queryClient,
		newsletterTiers,
		stripePlanRef,
		mapStripePlanToProduct,
		cardData,
	] );

	const monthyPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'month' );
	const annualPlan = cardData.plans.find( ( plan: any ) => plan.plan_interval === 'year' );

	if ( ! cardData.plans.length ) {
		return (
			<NoPlans
				cardData={ cardData }
				selectedSite={ selectedSite }
				engine={ engine }
				siteSlug={ siteSlug }
				onStartImport={ onStartImport }
			/>
		);
	}

	// Fall back to whichever interval is present so the add-tier modal still has sane defaults.
	const referenceMonth = monthyPlan ?? annualPlan;
	const referenceYear = annualPlan ?? monthyPlan;

	const tierToAdd = {
		via: '',
		currency: referenceMonth.plan_currency,
		price: formatCurrencyFloat( referenceMonth.plan_amount_decimal, referenceMonth.plan_currency ),
		type: TYPE_TIER,
		title: __( 'Newsletter tier' ),
		interval: PLAN_MONTHLY_FREQUENCY,
		annualProduct: {
			currency: referenceYear.plan_currency,
			price: formatCurrencyFloat( referenceYear.plan_amount_decimal, referenceYear.plan_currency ),
			type: TYPE_TIER,
			interval: PLAN_YEARLY_FREQUENCY,
		},
	};

	const isImportButtonDisabled =
		! shouldEnableImporting( cardData ) || isSavingPlanMapping || isSavingCompPlan;

	const compCount = parseInt( cardData?.meta?.comp_count || '0' );
	const onCompPlanSelect = ( stripePlanId: string ) => {
		setCompPlan( selectedSite.ID, engine, currentStep, stripePlanId );
	};

	const onProductSelect = ( stripePlanId: string, productId: string ) => {
		mapStripePlanToProduct( selectedSite.ID, engine, currentStep, stripePlanId, productId );
	};

	const onProductAdd = ( tierToAdd: TierToAdd, via: string ) => {
		stripePlanRef.current = via;
		setProductToAdd( tierToAdd );
	};

	const allEmailsCount = parseInt( cardData?.meta?.email_count || '0' );

	return (
		<>
			<SuccessNotice allEmailsCount={ allEmailsCount } />
			<h2>{ __( 'Paid subscribers' ) }</h2>
			<p>
				{ createInterpolateElement(
					__(
						'<strong>Review the plans retrieved from Stripe and create equivalents in WordPress.com</strong> to prevent disruptions for your current paid subscribers.'
					),
					{
						strong: <strong />,
					}
				) }
			</p>
			<div className="map-plans__mapping">
				<p>
					<strong>{ __( 'Existing Stripe plans' ) }</strong>
				</p>
				{ cardData.plans.map( ( plan: any ) => {
					tierToAdd.via = plan.product_id;
					const selectedProductId =
						( cardData.map_plans.hasOwnProperty( plan.product_id ) &&
							cardData.map_plans[ plan.product_id ] ) ??
						'';
					return (
						<MapPlan
							key={ plan.plan_id }
							plan={ plan }
							products={ cardData.available_tiers }
							onProductSelect={ onProductSelect }
							onProductAdd={ onProductAdd }
							tierToAdd={ tierToAdd }
							selectedProductId={ selectedProductId }
						/>
					);
				} ) }
				{ compCount > 0 && (
					<MapCompPlan
						compCount={ compCount }
						plans={ cardData.plans }
						selectedStripePlanId={ cardData.comp_stripe_plan_id ?? '' }
						onCompPlanSelect={ onCompPlanSelect }
					/>
				) }
			</div>

			<StartImportButton
				engine={ engine }
				siteId={ selectedSite.ID }
				step={ currentStep }
				navigate={ onStartImport }
				disabled={ isImportButtonDisabled }
			/>

			{ productToAdd && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ productToAdd }
					annualProduct={ productToAdd.annualProduct }
					isOnlyTier
					siteId={ selectedSite.ID }
					hideWelcomeEmailInput
					hideAdvancedSettings
				/>
			) }
		</>
	);
}
