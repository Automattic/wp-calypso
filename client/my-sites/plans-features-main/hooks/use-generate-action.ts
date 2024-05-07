import { type PlanSlug, isFreePlan, isBusinessPlan } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import useGenerateActionCallback from './use-generate-action-callback';
import type {
	PlanActionOverrides,
	PlansIntent,
	// UseActionCallback,
} from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useGenerateAction( {
	canUserManageCurrentPlan,
	currentPlan,
	domainFromHomeUpsellFlow,
	eligibleForFreeHostingTrial,
	cartHandler,
	flowName,
	isInSignup,
	intent,
	intentFromProps,
	showModalAndExit,
	sitePlanSlug,
	siteSlug,
	withDiscount,
}: {
	canUserManageCurrentPlan: boolean | null;
	currentPlan: Plans.SitePlan | undefined;
	domainFromHomeUpsellFlow: string | null;
	eligibleForFreeHostingTrial: boolean;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	isInSignup: boolean;
	intent?: PlansIntent | null;
	intentFromProps?: PlansIntent | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	sitePlanSlug?: PlanSlug | null;
	siteSlug?: string | null;
	withDiscount?: string;
} ) {
	// const useActionCallback = useGenerateActionCallback( {
	// 	currentPlan,
	// 	eligibleForFreeHostingTrial,
	// 	cartHandler,
	// 	flowName,
	// 	intent,
	// 	showModalAndExit,
	// 	sitePlanSlug,
	// 	siteSlug,
	// 	withDiscount,
	// } );

	const translate = useTranslate();

	return ( {
		isFreeTrialAction,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
	}: {
		isFreeTrialAction?: boolean;
		isLargeCurrency?: boolean;
		isStuck?: boolean;
		planSlug: PlanSlug;
		planTitle?: string;
		priceString?: string;
	} ) => {
		// const actionCallback = useActionCallback( { planSlug } )
		let actions: PlanActionOverrides = {
			currentPlan: {},
			loggedInFreePlan: {},
			trialAlreadyUsed: {},
		};

		/* 1. Onboarding actions */
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
				postButtonText,
				// TODO: Revisit status
				status: 'enabled',
				text,
			};
		}

		/* 2. Current plan actions */
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
