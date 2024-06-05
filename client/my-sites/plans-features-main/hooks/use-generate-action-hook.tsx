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
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getDomainFromHomeUpsellInQuery from 'calypso/state/selectors/get-domain-from-home-upsell-in-query';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors/is-current-user-current-plan-owner';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import isCurrentPlanPaid from 'calypso/state/sites/selectors/is-current-plan-paid';
import { IAppState } from 'calypso/state/types';
import useGenerateActionCallback from './use-generate-action-callback';
import type { GridAction, PlansIntent, UseAction } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useGenerateActionHook( {
	siteId,
	cartHandler,
	flowName,
	plansIntent,
	isInSignup,
	isLaunchPage,
	showModalAndExit,
	withDiscount,
}: {
	siteId?: number | null;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	plansIntent?: PlansIntent | null;
	isInSignup: boolean;
	isLaunchPage: boolean | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	withDiscount?: string;
} ): UseAction {
	const translate = useTranslate();
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const currentPlanExpiryDate = Plans.useCurrentPlanExpiryDate( { siteId } );
	const isPlanExpired = currentPlanExpiryDate
		? currentPlanExpiryDate.getTime() < Date.now()
		: false;
	const siteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );
	const sitePlanSlug = currentPlan?.planSlug;
	const domainFromHomeUpsellFlow = useSelector( getDomainFromHomeUpsellInQuery );
	const canUserManageCurrentPlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const eligibleForFreeHostingTrial = useSelector( isUserEligibleForFreeHostingTrial );

	const getActionCallback = useGenerateActionCallback( {
		currentPlan,
		eligibleForFreeHostingTrial,
		cartHandler,
		flowName,
		intent: plansIntent,
		showModalAndExit,
		sitePlanSlug,
		siteSlug,
		withDiscount,
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
	}: {
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
	} ): GridAction => {
		/**
		 * 1. Enterprise Plan actions
		 */
		if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
			const text = translate( 'Learn more' );
			return {
				primary: {
					callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
					status: 'enabled',
					text,
				},
			};
		}

		/**
		 * 2. Launch Page actions
		 */
		if ( isLaunchPage ) {
			let text = translate( 'Select %(plan)s', {
				args: { plan: planTitle ?? '' },
				context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
				comment:
					'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
			} );

			if ( isFreePlan( planSlug ) ) {
				text = translate( 'Keep this plan', {
					comment:
						'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} );
			} else if ( isStuck && ! isLargeCurrency ) {
				/**
				 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
				 */
				text = translate( 'Select %(plan)s – %(priceString)s', {
					args: {
						plan: planTitle ?? '',
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium - $10',
				} );
			}

			return {
				primary: {
					callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
					text,
				},
			};
		}

		/**
		 * 3. Onboarding actions
		 */
		if ( isInSignup ) {
			let text = translate( 'Get %(plan)s', {
				args: {
					plan: planTitle ?? '',
				},
			} );
			let postButtonText;

			if ( isFreeTrialAction ) {
				text = translate( 'Try for free' );
			} else if ( isFreePlan( planSlug ) ) {
				text = translate( 'Start with Free' );
			} else if ( isStuck && ! isLargeCurrency ) {
				/**
				 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
				 */
				text = translate( 'Get %(plan)s – %(priceString)s', {
					args: {
						plan: planTitle ?? '',
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
					// TODO: Revisit this type and why we have to force inference of string
				} ) as string;
			} else if ( isStuck && isLargeCurrency ) {
				/**
				 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price alongside the plan name.
				 */
				text = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
					args: {
						plan: planTitle ?? '',
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
					components: {
						span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
					},
				} );
			}

			if (
				isBusinessPlan( planSlug ) &&
				! eligibleForFreeHostingTrial &&
				plansIntent === 'plans-new-hosted-site'
			) {
				postButtonText = translate( "You've already used your free trial! Thanks!" );
			}

			return {
				primary: {
					callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
					status: 'enabled',
					text,
				},
				postButtonText,
			};
		}

		/**
		 * 4. Logged-In (Admin) Plans actions
		 */
		let text = translate( 'Upgrade', { context: 'verb' } );
		let status: 'enabled' | 'disabled' | 'blocked' | undefined;
		const current = sitePlanSlug === planSlug;
		const isTrialPlan =
			sitePlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY ||
			sitePlanSlug === PLAN_MIGRATION_TRIAL_MONTHLY ||
			sitePlanSlug === PLAN_HOSTING_TRIAL_MONTHLY;

		// TODO: Revisit WooExpress overrides and how to better structure this logic
		let textOverride;

		if ( isWooExpressMediumPlan( planSlug ) && ! isWooExpressMediumPlan( sitePlanSlug || '' ) ) {
			textOverride = translate( 'Get Performance', { textOnly: true } );
		} else if (
			isWooExpressSmallPlan( planSlug ) &&
			! isWooExpressSmallPlan( sitePlanSlug || '' )
		) {
			textOverride = translate( 'Get Essential', { textOnly: true } );
		} else if ( isBusinessTrial( sitePlanSlug || '' ) ) {
			textOverride = translate( 'Get %(plan)s', {
				textOnly: true,
				args: {
					plan: getPlan( planSlug )?.getTitle() || '',
				},
			} );
		}

		if ( isFreePlan( planSlug ) ) {
			text = translate( 'Contact support', { context: 'verb' } );
			status = 'disabled';

			if ( current ) {
				text = translate( 'Manage add-ons', { context: 'verb' } );
				status = 'enabled';
			}
		} else if (
			availableForPurchase &&
			sitePlanSlug &&
			! current &&
			! isTrialPlan &&
			currentPlanBillingPeriod &&
			billingPeriod &&
			currentPlanBillingPeriod > billingPeriod
		) {
			// If the current plan is on a higher-term but lower-tier, then show a "Contact support" button.
			// TODO: We should revisit this. The plan term selector never allows selection of lower term plans so is this condition ever met?
			text = translate( 'Contact support', { context: 'verb' } );
		} else if (
			availableForPurchase &&
			sitePlanSlug &&
			! current &&
			getPlanClass( planSlug ) === getPlanClass( sitePlanSlug ) &&
			! isTrialPlan
		) {
			// If the current plan matches on a lower-term, then show an "Upgrade to..." button.
			if ( planMatches( planSlug, { term: TERM_TRIENNIALLY } ) ) {
				text = textOverride || translate( 'Upgrade to Triennial' );
			}

			if ( planMatches( planSlug, { term: TERM_BIENNIALLY } ) ) {
				text = textOverride || translate( 'Upgrade to Biennial' );
			}

			if ( planMatches( planSlug, { term: TERM_ANNUALLY } ) ) {
				text = textOverride || translate( 'Upgrade to Yearly' );
			}
		} else if ( current ) {
			// All other actions for a current plan
			text = translate( 'View plan' );

			if ( canUserManageCurrentPlan ) {
				if ( isPlanExpired ) {
					text = translate( 'Renew plan' );
				} else {
					text = translate( 'Manage plan' );
				}
			} else if ( domainFromHomeUpsellFlow ) {
				text = translate( 'Keep my plan', { context: 'verb' } );
			}
		} else if ( textOverride ) {
			text = textOverride;
		} else if ( isStuck && availableForPurchase ) {
			/**
			 * `isStuck` indicates the buttons are fixed/sticky in the grid, and we show the price.
			 */
			text = translate( 'Upgrade – %(priceString)s', {
				context: 'verb',
				args: { priceString: priceString ?? '' },
				comment: '%(priceString)s is the full price including the currency. Eg: Get Upgrade - $10',
			} );

			if ( isLargeCurrency ) {
				text = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
					args: {
						plan: planTitle ?? '',
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
					components: {
						span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
					},
				} );
			}
		} else if ( ! availableForPurchase ) {
			text = translate( 'Downgrade', { context: 'verb' } );
		}

		return {
			primary: {
				callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
				status,
				text,
			},
		};
	};

	return useActionHook;
}

export default useGenerateActionHook;
