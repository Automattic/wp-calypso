import {
	type PlanSlug,
	isP2FreePlan,
	isFreePlan,
	PLAN_FREE,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../grid-context';
import useIsLargeCurrency from '../../../hooks/use-is-large-currency';
import { usePlanPricingInfoFromGridPlans } from '../../../hooks/use-plan-pricing-info-from-grid-plans';
import PlanButton from '../../plan-button';
import { useDefaultStorageOption } from '../../shared/storage';
import type { GridPlan, PlanActionOverrides } from '../../../types';
import './style.scss';

type ActionButtonProps = {
	availableForPurchase: boolean;
	currentSitePlanSlug?: string | null;
	isPopular?: boolean;
	isInSignup?: boolean;
	isMonthlyPlan?: boolean;
	planSlug: PlanSlug;
	buttonText?: TranslateResult;
	planActionOverrides?: PlanActionOverrides;
	showMonthlyPrice: boolean;
	isStuck: boolean;
	visibleGridPlans: GridPlan[];
	showPostButtonText?: boolean;
};

const ActionButton = ( {
	planSlug,
	currentSitePlanSlug,
	visibleGridPlans,
	availableForPurchase,
	buttonText,
	isStuck,
	isInSignup,
	isMonthlyPlan,
	showPostButtonText = true,
}: ActionButtonProps ) => {
	const translate = useTranslate();
	const {
		gridPlansIndex,
		siteId,
		helpers: { useAction },
		showBillingDescriptionForIncreasedRenewalPrice,
	} = usePlansGridContext();
	const {
		current,
		planTitle,
		pricing: { billingPeriod, currencyCode, originalPrice, discountedPrice },
		freeTrialPlanSlug,
		cartItemForPlan,
	} = gridPlansIndex[ planSlug ];
	const currentPlanBillingPeriod = currentSitePlanSlug
		? gridPlansIndex[ currentSitePlanSlug ]?.pricing.billingPeriod
		: undefined;
	const { prices } = usePlanPricingInfoFromGridPlans( {
		gridPlans: visibleGridPlans,
	} );
	const isLargeCurrency = useIsLargeCurrency( { prices, currencyCode: currencyCode || 'USD' } );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug, siteId ]
	);
	const selectedStorageAddOn = storageAddOns?.find( ( addOn ) => {
		return selectedStorageOptionForPlan && addOn
			? addOn.addOnSlug === selectedStorageOptionForPlan
			: false;
	} );

	const priceString = formatCurrency(
		( discountedPrice.monthly || originalPrice.monthly ) ?? 0,
		currencyCode || 'USD',
		{
			stripZeros: true,
			isSmallestUnit: true,
		}
	);

	const {
		primary: { callback, text, status, variant, ariaLabel },
		postButtonText,
	} = useAction( {
		availableForPurchase,
		billingPeriod,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
		cartItemForPlan,
		currentPlanBillingPeriod,
		selectedStorageAddOn,
		pricing: gridPlansIndex[ planSlug ]?.pricing,
		isMonthlyPlan,
	} );
	const shouldUseButtonText = !! buttonText && ! current && availableForPurchase;
	const primaryText = shouldUseButtonText ? buttonText : text;
	const primaryAriaLabel = shouldUseButtonText ? buttonText : ariaLabel;
	const {
		primary: { callback: freeTrialCallback, text: freeTrialText },
	} = useAction( {
		billingPeriod,
		isFreeTrialAction: true,
		isLargeCurrency,
		isStuck,
		// TODO: Unsure about using free plan as a fallback. We should revisit.
		planSlug: freeTrialPlanSlug ?? PLAN_FREE,
		planTitle,
		priceString,
		cartItemForPlan: { product_slug: freeTrialPlanSlug ?? PLAN_FREE },
		currentPlanBillingPeriod,
		selectedStorageAddOn,
		pricing: gridPlansIndex[ freeTrialPlanSlug ?? PLAN_FREE ]?.pricing,
		isMonthlyPlan,
	} );

	const busy = status === 'blocked';

	const defaultStorageOption = useDefaultStorageOption( { planSlug } );
	const canPurchaseStorageAddOns = storageAddOns?.some(
		( storageAddOn ) => ! storageAddOn?.purchased
	);

	const storageAddOnCheckoutHref = storageAddOns?.find(
		( addOn ) => selectedStorageOptionForPlan && addOn?.addOnSlug === selectedStorageOptionForPlan
	)?.checkoutLink;

	const nonDefaultStorageOptionSelected =
		selectedStorageOptionForPlan && defaultStorageOption !== selectedStorageOptionForPlan;

	let actionButton = (
		<PlanButton
			planSlug={ planSlug }
			onClick={ callback }
			busy={ busy }
			disabled={ ! callback || 'disabled' === status }
			classes={ variant === 'secondary' ? 'is-secondary' : '' }
			ariaLabel={ String( primaryAriaLabel || '' ) }
		>
			{ primaryText }
		</PlanButton>
	);

	if (
		( isFreePlan( planSlug ) ||
			( storageAddOns && ! canPurchaseStorageAddOns && nonDefaultStorageOptionSelected ) ) &&
		isP2FreePlan( planSlug ) &&
		current
	) {
		return null;
	}

	if ( availableForPurchase || current || isWpcomEnterpriseGridPlan( planSlug ) ) {
		// TODO: Move the condition below into the useAction hook
		if (
			current &&
			canPurchaseStorageAddOns &&
			nonDefaultStorageOptionSelected &&
			! isMonthlyPlan
		) {
			actionButton = (
				<PlanButton
					planSlug={ planSlug }
					classes="is-storage-upgradeable"
					href={ storageAddOnCheckoutHref }
					busy={ busy }
					ariaLabel={ translate( 'Upgrade storage for this plan' ).toString() }
				>
					{ translate( 'Upgrade' ) }
				</PlanButton>
			);
		} else {
			const hasFreeTrialPlan = isInSignup ? !! freeTrialPlanSlug : false;
			actionButton = hasFreeTrialPlan ? (
				<div className="plans-grid-next-action-button__multi">
					<PlanButton planSlug={ planSlug } onClick={ () => freeTrialCallback() } busy={ busy }>
						{ freeTrialText }
					</PlanButton>
					{ ! isStuck && ( // along side with the free trial CTA, we also provide an option for purchasing the plan directly here
						<PlanButton
							planSlug={ planSlug }
							onClick={ callback }
							busy={ busy }
							borderless
							ariaLabel={ String( primaryAriaLabel || '' ) }
						>
							{ primaryText }
						</PlanButton>
					) }
				</div>
			) : (
				<>
					<PlanButton
						planSlug={ planSlug }
						disabled={ ! callback || 'disabled' === status }
						busy={ busy }
						onClick={ callback }
						// A primary variant on the current plan (e.g. renewing when a downgrade
						// is scheduled) should render as a plan-colored CTA, not the muted
						// current-plan style.
						current={ current && variant !== 'primary' }
						ariaLabel={ String( primaryAriaLabel || '' ) }
					>
						{ primaryText }
					</PlanButton>
					{ showPostButtonText && postButtonText && (
						<span
							className={ clsx( 'plans-grid-next-action-button__label', {
								'is-left-aligned': showBillingDescriptionForIncreasedRenewalPrice,
							} ) }
						>
							{ postButtonText }
						</span>
					) }
				</>
			);
		}
	} else if (
		showPostButtonText &&
		postButtonText &&
		showBillingDescriptionForIncreasedRenewalPrice
	) {
		actionButton = (
			<>
				{ actionButton }
				<span
					className={ clsx( 'plans-grid-next-action-button__label', {
						'is-left-aligned': showBillingDescriptionForIncreasedRenewalPrice,
					} ) }
				>
					{ postButtonText }
				</span>
			</>
		);
	}

	return (
		<div className="plans-grid-next-action-button">
			<div
				className="plans-grid-next-action-button__content"
				style={ ! primaryText ? { visibility: 'hidden' } : undefined }
			>
				{ actionButton }
			</div>
		</div>
	);
};

export default ActionButton;
