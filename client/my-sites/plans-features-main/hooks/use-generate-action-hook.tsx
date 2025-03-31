import { isEnabled } from '@automattic/calypso-config';
import {
	type PlanSlug,
	isFreePlan,
	isBusinessPlan,
	isWpcomEnterpriseGridPlan,
	getPlanClass,
	planMatches,
	TERM_TRIENNIALLY,
	TERM_BIENNIALLY,
	TERM_ANNUALLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
	isBusinessTrial,
	getPlan,
} from '@automattic/calypso-products';
import { AddOns, PlanPricing, Plans } from '@automattic/data-stores';
import { useState } from '@wordpress/element';
import { type LocalizeProps, type TranslateResult, useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors/is-current-user-current-plan-owner';
import isCurrentPlanPaid from 'calypso/state/sites/selectors/is-current-plan-paid';
import { IAppState } from 'calypso/state/types';
import useGenerateActionCallback from './use-generate-action-callback';
import type {
	GridAction,
	PlansIntent,
	UseAction,
	UseActionCallback,
} from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

type UseActionHookProps = {
	availableForPurchase?: boolean;
	cartItemForPlan?: MinimalRequestCartProduct | null;
	isFreeTrialAction?: boolean;
	isLargeCurrency?: boolean;
	isStuck?: boolean;
	planSlug: PlanSlug;
	priceString?: string;
	selectedStorageAddOn?: AddOns.AddOnMeta | null;
	/**
	 * We could derive `billingPeriod` directly from here (via `usePricingMetaForGridPlans`),
	 * although it will be ambiguous since we can't know how it was called from consuming end (what props were passed in).
	 */
	billingPeriod?: PlanPricing[ 'billPeriod' ];
	currentPlanBillingPeriod?: PlanPricing[ 'billPeriod' ];
	/**
	 * We can safely derive `planTitle` from one of the data-store or calypso-products hooks/selectors.
	 */
	planTitle?: TranslateResult;
};

export default function useGenerateActionHook( {
	siteId,
	cartHandler,
	flowName,
	plansIntent,
	isInSignup,
	isLaunchPage,
	showModalAndExit,
	coupon,
}: {
	siteId?: number | null;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	plansIntent?: PlansIntent | null;
	isInSignup: boolean;
	isLaunchPage: boolean | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	coupon?: string;
} ): UseAction {
	const translate = useTranslate();
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const currentPlanExpiryDate = Plans.useCurrentPlanExpiryDate( { siteId } );
	const isPlanExpired = currentPlanExpiryDate
		? currentPlanExpiryDate.getTime() < Date.now()
		: false;

	const sitePlanSlug = currentPlan?.planSlug;
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const canUserManageCurrentPlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const eligibleForFreeHostingTrial = useSelector( isUserEligibleForFreeHostingTrial );

	const [ isLoading, setIsLoading ] = useState( false );

	// TODO: Remove this hook call and inline the logic into respective functions
	const getActionCallback = useGenerateActionCallback( {
		currentPlan,
		eligibleForFreeHostingTrial,
		cartHandler,
		flowName,
		intent: plansIntent,
		showModalAndExit,
		sitePlanSlug,
		siteId,
		coupon,
	} );

	const useActionHook = ( {
		availableForPurchase,
		cartItemForPlan,
		isFreeTrialAction,
		isLargeCurrency,
		isStuck,
		planSlug,
		priceString,
		selectedStorageAddOn,
		billingPeriod,
		currentPlanBillingPeriod,
		planTitle,
	}: UseActionHookProps ): GridAction => {
		/**
		 * 1. Enterprise Plan actions
		 */
		if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
			return {
				primary: {
					callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
					status: 'enabled',
					text: translate( 'Learn more' ),
				},
			};
		}

		/**
		 * 2. Launch Page actions
		 */
		if ( isLaunchPage ) {
			return getLaunchPageAction( {
				getActionCallback,
				planSlug,
				cartItemForPlan,
				selectedStorageAddOn,
				translate,
				isLargeCurrency,
				isStuck,
				planTitle,
				priceString,
			} );
		}

		/**
		 * 3. Onboarding actions
		 */
		if ( isInSignup ) {
			return getSignupAction( {
				getActionCallback,
				planSlug,
				cartItemForPlan,
				selectedStorageAddOn,
				translate,
				isLargeCurrency,
				isStuck,
				planTitle,
				priceString,
				isFreeTrialAction,
				eligibleForFreeHostingTrial,
				plansIntent,
			} );
		}

		/**
		 * 4. Logged-In (Admin) Plans actions
		 */
		return getLoggedInPlansAction( {
			getActionCallback,
			planSlug,
			cartItemForPlan,
			selectedStorageAddOn,
			translate,
			isLargeCurrency,
			isStuck,
			planTitle,
			priceString,
			sitePlanSlug,
			availableForPurchase,
			domainFromHomeUpsellFlow,
			canUserManageCurrentPlan,
			isPlanExpired,
			currentPlanBillingPeriod,
			billingPeriod,
			setIsLoading,
			isLoading,
		} );
	};

	return useActionHook;
}

function getLaunchPageAction( {
	getActionCallback,
	planSlug,
	cartItemForPlan,
	selectedStorageAddOn,
	translate,
	isLargeCurrency,
	isStuck,
	planTitle,
	priceString,
}: {
	getActionCallback: UseActionCallback;
	planSlug: PlanSlug;
	translate: LocalizeProps[ 'translate' ];
} & UseActionHookProps ) {
	const createLaunchPageAction = ( text: TranslateResult ) => ( {
		primary: {
			callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
			text,
		},
	} );

	if ( isFreePlan( planSlug ) ) {
		return createLaunchPageAction(
			translate( 'Keep this plan', {
				comment:
					'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
			} )
		);
	}
	if ( isStuck && ! isLargeCurrency ) {
		/**
		 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
		 */
		return createLaunchPageAction(
			translate( 'Select %(plan)s ⋅ %(priceString)s', {
				args: {
					plan: planTitle ?? '',
					priceString: priceString ?? '',
				},
				comment:
					'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium ⋅ $10',
			} )
		);
	}

	return createLaunchPageAction(
		translate( 'Select %(plan)s', {
			args: { plan: planTitle ?? '' },
			context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
			comment:
				'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
		} )
	);
}

function getSignupAction( {
	getActionCallback,
	planSlug,
	cartItemForPlan,
	selectedStorageAddOn,
	translate,
	isLargeCurrency,
	isStuck,
	planTitle,
	priceString,
	isFreeTrialAction,
	eligibleForFreeHostingTrial,
	plansIntent,
}: {
	getActionCallback: UseActionCallback;
	planSlug: PlanSlug;
	translate: LocalizeProps[ 'translate' ];
	eligibleForFreeHostingTrial: boolean;
	plansIntent?: PlansIntent | null;
} & UseActionHookProps ): GridAction {
	const createSignupAction = ( text: TranslateResult, postButtonText?: TranslateResult ) => ( {
		primary: {
			callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
			text,
		},
		postButtonText,
	} );

	if ( isFreeTrialAction ) {
		return createSignupAction( translate( 'Try for free' ) );
	}

	if ( isFreePlan( planSlug ) ) {
		return createSignupAction( translate( 'Start with Free' ) );
	}

	if ( isStuck ) {
		/**
		 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
		 */
		return createSignupAction(
			isLargeCurrency
				? translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
						args: {
							plan: planTitle ?? '',
							priceString: priceString ?? '',
						},
						comment:
							'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium ⋅ $10',
						components: {
							span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
						},
				  } )
				: translate( 'Get %(plan)s ⋅ %(priceString)s', {
						args: {
							plan: planTitle ?? '',
							priceString: priceString ?? '',
						},
						comment:
							'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium ⋅ $10',
				  } )
		);
	}

	if (
		isBusinessPlan( planSlug ) &&
		! eligibleForFreeHostingTrial &&
		plansIntent === 'plans-new-hosted-site'
	) {
		return createSignupAction(
			translate( 'Get %(plan)s', {
				args: {
					plan: planTitle ?? '',
				},
			} ),
			translate( "You've already used your free trial! Thanks!" )
		);
	}

	return createSignupAction(
		translate( 'Get %(plan)s', {
			args: {
				plan: planTitle ?? '',
			},
		} )
	);
}

function getLoggedInPlansAction( {
	getActionCallback,
	planSlug,
	cartItemForPlan,
	selectedStorageAddOn,
	translate,
	isLargeCurrency,
	isStuck,
	planTitle,
	priceString,
	sitePlanSlug,
	availableForPurchase,
	domainFromHomeUpsellFlow,
	canUserManageCurrentPlan,
	isPlanExpired,
	currentPlanBillingPeriod,
	billingPeriod,
	isLoading,
	setIsLoading,
}: {
	getActionCallback: UseActionCallback;
	planSlug: PlanSlug;
	translate: LocalizeProps[ 'translate' ];
	sitePlanSlug: PlanSlug | undefined;
	domainFromHomeUpsellFlow: string | null;
	isPlanExpired: boolean;
	canUserManageCurrentPlan: boolean | null;
	isLoading: boolean;
	setIsLoading: ( value: boolean ) => void;
} & UseActionHookProps ): GridAction {
	const current = sitePlanSlug === planSlug;
	const isTrialPlan =
		sitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
		sitePlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
		sitePlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;

	const createLoggedInPlansAction = (
		text: TranslateResult,
		variant: GridAction[ 'primary' ][ 'variant' ] = 'primary'
	) => ( {
		primary: {
			callback: async () => {
				// FIXME:
				// This callback is utilizing the implict knowledge that we know the only true async
				// action happening in the logged-in plans grid. Once `useGenerateActionHook` and `UseGenerateActionCallback` are merged
				// as described by Automattic/martech#3170, we will be able to clean this up.
				setIsLoading( true );
				await getActionCallback( {
					planSlug,
					cartItemForPlan,
					selectedStorageAddOn,
					availableForPurchase,
				} )();
				setIsLoading( false );
				return;
			},
			status: ( isLoading ? 'blocked' : 'enabled' ) as GridAction[ 'primary' ][ 'status' ],
			text,
			variant,
		},
	} );

	// All actions for the current plan
	if ( current ) {
		if ( isFreePlan( planSlug ) ) {
			return createLoggedInPlansAction( translate( 'Manage add-ons', { context: 'verb' } ) );
		}
		if ( domainFromHomeUpsellFlow ) {
			return createLoggedInPlansAction( translate( 'Keep my plan', { context: 'verb' } ) );
		}
		if ( canUserManageCurrentPlan && isPlanExpired ) {
			return createLoggedInPlansAction( translate( 'Renew plan' ) );
		}

		if ( canUserManageCurrentPlan ) {
			return createLoggedInPlansAction( translate( 'Manage plan' ), 'secondary' );
		}

		return createLoggedInPlansAction( translate( 'View plan' ), 'secondary' );
	}

	// Downgrade action if the plan is not available for purchase
	if ( ! availableForPurchase ) {
		if ( isEnabled( 'plans/self-service-downgrade' ) ) {
			return {
				primary: {
					callback: () => {},
					text: translate( 'Requires downgrade' ),
					status: 'disabled',
				},
			};
		}
		return createLoggedInPlansAction( translate( 'Downgrade', { context: 'verb' } ), 'secondary' );
	}

	/**
	 * This action would be shown if the selected billing period is
	 * less than the billing period of the current plan.
	 * TODO: investigate since we already hide lower terms in the interval dropdown.
	 */
	if (
		sitePlanSlug &&
		! current &&
		! isTrialPlan &&
		currentPlanBillingPeriod &&
		billingPeriod &&
		currentPlanBillingPeriod > billingPeriod
	) {
		return createLoggedInPlansAction(
			translate( 'Contact support', { context: 'verb' } ),
			'secondary'
		);
	}

	/**
	 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
	 */
	if ( isStuck ) {
		return createLoggedInPlansAction(
			isLargeCurrency
				? translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
						args: {
							plan: planTitle ?? '',
							priceString: priceString ?? '',
						},
						comment:
							'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium ⋅ $10',
						components: {
							span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
						},
				  } )
				: translate( 'Upgrade ⋅ %(priceString)s', {
						context: 'verb',
						args: { priceString: priceString ?? '' },
						comment:
							'%(priceString)s is the full price including the currency. Eg: Get Upgrade ⋅ $10',
				  } )
		);
	}

	if (
		sitePlanSlug &&
		getPlanClass( planSlug ) === getPlanClass( sitePlanSlug ) &&
		! isTrialPlan
	) {
		// If the current plan matches on a lower-term, then show an "Upgrade to..." button.
		if ( planMatches( planSlug, { term: TERM_TRIENNIALLY } ) ) {
			return createLoggedInPlansAction( translate( 'Upgrade to Triennial' ) );
		}

		if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
			return createLoggedInPlansAction( translate( 'Upgrade to Biennial' ) );
		}

		if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
			return createLoggedInPlansAction( translate( 'Upgrade to Yearly' ) );
		}
	}

	if ( isWooExpressMediumPlan( planSlug ) && ! isWooExpressMediumPlan( sitePlanSlug || '' ) ) {
		return createLoggedInPlansAction( translate( 'Get Performance', { textOnly: true } ) );
	}
	if ( isWooExpressSmallPlan( planSlug ) && ! isWooExpressSmallPlan( sitePlanSlug || '' ) ) {
		return createLoggedInPlansAction( translate( 'Get Essential', { textOnly: true } ) );
	}

	if ( isBusinessTrial( sitePlanSlug || '' ) ) {
		return createLoggedInPlansAction(
			translate( 'Get %(plan)s', {
				textOnly: true,
				args: {
					plan: getPlan( planSlug )?.getTitle() || '',
				},
			} )
		);
	}

	return createLoggedInPlansAction( translate( 'Upgrade', { context: 'verb' } ) );
}
