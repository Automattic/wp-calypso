import {
	type PlanSlug,
	isP2FreePlan,
	isFreePlan,
	PLAN_FREE,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
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
	buttonText?: string;
	planActionOverrides?: PlanActionOverrides;
	showMonthlyPrice: boolean;
	isStuck: boolean;
	visibleGridPlans: GridPlan[];
};

const ActionButton = ( {
	planSlug,
	currentSitePlanSlug,
	visibleGridPlans,
	availableForPurchase,
	isStuck,
	isInSignup,
	isMonthlyPlan,
}: ActionButtonProps ) => {
	const translate = useTranslate();
	const {
		gridPlansIndex,
		siteId,
		helpers: { useAction },
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
		[ planSlug ]
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
		primary: { callback, text, status, variant },
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
	} );
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
	} );

	const busy = status === 'blocked';

	const defaultStorageOption = useDefaultStorageOption( { planSlug } );
	const canPurchaseStorageAddOns = storageAddOns?.some(
		( storageAddOn ) => ! storageAddOn?.purchased && ! storageAddOn?.exceedsSiteStorageLimits
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
		>
			{ text }
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
						<PlanButton planSlug={ planSlug } onClick={ callback } busy={ busy } borderless>
							{ text }
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
						current={ current }
					>
						{ text }
					</PlanButton>
					{ postButtonText && (
						<span className="plans-grid-next-action-button__label">{ postButtonText }</span>
					) }
				</>
			);
		}
	}

	return (
		<div className="plans-grid-next-action-button">
			<div className="plans-grid-next-action-button__content">{ actionButton }</div>
		</div>
	);
};

export default ActionButton;
