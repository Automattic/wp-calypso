import { type PlanSlug, isFreePlan, isBusinessPlan } from '@automattic/calypso-products';
import { AddOns, Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import useGenerateActionCallback from './use-generate-action-callback';
import type { PlanActionOverrides, PlansIntent } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useGenerateAction( {
	canUserManageCurrentPlan,
	cartHandler,
	currentPlan,
	domainFromHomeUpsellFlow,
	eligibleForFreeHostingTrial,
	flowName,
	intent,
	intentFromProps,
	isInSignup,
	isLaunchPage,
	showModalAndExit,
	sitePlanSlug,
	siteSlug,
	withDiscount,
}: {
	canUserManageCurrentPlan: boolean | null;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	currentPlan: Plans.SitePlan | undefined;
	domainFromHomeUpsellFlow: string | null;
	eligibleForFreeHostingTrial: boolean;
	flowName?: string | null;
	intent?: PlansIntent | null;
	intentFromProps?: PlansIntent | null;
	isInSignup: boolean;
	isLaunchPage: boolean | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	sitePlanSlug?: PlanSlug | null;
	siteSlug?: string | null;
	withDiscount?: string;
} ) {
	const getActionCallback = useGenerateActionCallback( {
		currentPlan,
		eligibleForFreeHostingTrial,
		cartHandler,
		flowName,
		intent,
		showModalAndExit,
		sitePlanSlug,
		siteSlug,
		withDiscount,
	} );

	const translate = useTranslate();

	return ( {
		cartItemForPlan,
		isFreeTrialAction,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
		selectedStorageAddOn,
	}: {
		cartItemForPlan?: MinimalRequestCartProduct | null;
		isFreeTrialAction?: boolean;
		isLargeCurrency?: boolean;
		isStuck?: boolean;
		planSlug: PlanSlug;
		planTitle?: string;
		priceString?: string;
		selectedStorageAddOn?: AddOns.AddOnMeta | null;
	} ) => {
		let actions: PlanActionOverrides = {
			currentPlan: {},
			loggedInFreePlan: {},
			trialAlreadyUsed: {},
		};

		/* 1. Launch Page actions */
		if ( isLaunchPage ) {
			let text = translate( 'Select %(plan)s', {
				args: {
					plan: planTitle,
				},
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
				text = translate( 'Select %(plan)s – %(priceString)s', {
					args: {
						plan: planTitle,
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Select Premium - $10',
				} );
			}

			return { text };
		}

		/* 2. Onboarding actions */
		if ( isInSignup ) {
			let text = translate( 'Get %(plan)s', {
				args: {
					plan: planTitle,
				},
			} );
			let postButtonText = null;

			if ( isFreeTrialAction ) {
				text = translate( 'Try for free' );
			} else if ( isFreePlan( planSlug ) ) {
				text = translate( 'Start with Free' );
			} else if ( isStuck && ! isLargeCurrency ) {
				text = translate( 'Get %(plan)s – %(priceString)s', {
					args: {
						plan: planTitle,
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
					// TODO: Revisit this type and why we have to force inference of string
				} ) as string;
			} else if ( isStuck && isLargeCurrency ) {
				text = translate( 'Get %(plan)s {{span}}%(priceString)s{{/span}}', {
					args: {
						plan: planTitle,
						priceString: priceString ?? '',
					},
					comment:
						'%(plan)s is the name of the plan and %(priceString)s is the full price including the currency. Eg: Get Premium - $10',
					components: {
						// span: <span className="plan-features-2023-grid__actions-signup-plan-text" />,
					},
				} );
			}

			if (
				isBusinessPlan( planSlug ) &&
				! eligibleForFreeHostingTrial &&
				intentFromProps === 'plans-new-hosted-site'
			) {
				postButtonText = translate( "You've already used your free trial! Thanks!" );
			}

			return {
				callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
				postButtonText,
				// TODO: Revisit status
				status: 'enabled',
				text,
			};
		}

		/* 3. Current plan actions */
		if ( sitePlanSlug && intentFromProps !== 'plans-p2' ) {
			if ( isFreePlan( sitePlanSlug ) ) {
				actions = {
					loggedInFreePlan: {
						status: 'enabled',
						text: translate( 'Manage add-ons', { context: 'verb' } ),
					},
				};

				if ( domainFromHomeUpsellFlow ) {
					actions.loggedInFreePlan = {
						...actions.loggedInFreePlan,
						text: translate( 'Keep my plan', { context: 'verb' } ),
					};
				}
			} else {
				actions = {
					currentPlan: {
						text: canUserManageCurrentPlan ? translate( 'Manage plan' ) : translate( 'View plan' ),
					},
				};
			}
		}

		return actions;
	};
}

export default useGenerateAction;
