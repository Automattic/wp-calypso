import {
	type PlanSlug,
	isFreePlan,
	isBusinessPlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { AddOns, Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import useGenerateActionCallback from './use-generate-action-callback';
import type { PlansIntent } from '@automattic/plans-grid-next';
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
		availableForPurchase,
		cartItemForPlan,
		isFreeTrialAction,
		isLargeCurrency,
		isStuck,
		planSlug,
		planTitle,
		priceString,
		selectedStorageAddOn,
	}: {
		availableForPurchase?: boolean;
		cartItemForPlan?: MinimalRequestCartProduct | null;
		isFreeTrialAction?: boolean;
		isLargeCurrency?: boolean;
		isStuck?: boolean;
		planSlug: PlanSlug;
		planTitle?: string;
		priceString?: string;
		selectedStorageAddOn?: AddOns.AddOnMeta | null;
	} ) => {
		/* 1. Enterprise Plan actions */
		if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
			const text = translate( 'Learn more' );
			return {
				callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
				text,
			};
		}

		/* 2. Launch Page actions */
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

			return {
				callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
				text,
			};
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

		/* 3. Logged In Plans actions */
		let text = translate( 'Upgrade', { context: 'verb' } );
		let status = null;

		if ( isFreePlan( planSlug ) ) {
			text = translate( 'Contact support', { context: 'verb' } );

			// TODO: Consider DRYing this up
			if ( sitePlanSlug === planSlug && intentFromProps !== 'plans-p2' ) {
				text = translate( 'Manage add-ons', { context: 'verb' } );
				status = 'enabled';
			}
		} else if ( sitePlanSlug === planSlug && intentFromProps !== 'plans-p2' ) {
			// Spotlight plan actions
			text = canUserManageCurrentPlan ? translate( 'Manage plan' ) : translate( 'View plan' );

			if ( domainFromHomeUpsellFlow ) {
				text = translate( 'Keep my plan', { context: 'verb' } );
			}
		} else if ( isStuck && ! isLargeCurrency ) {
			text = translate( 'Upgrade – %(priceString)s', {
				context: 'verb',
				args: { priceString: priceString ?? '' },
				comment: '%(priceString)s is the full price including the currency. Eg: Get Upgrade - $10',
			} );
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
		} else if ( ! availableForPurchase ) {
			text = translate( 'Downgrade', { context: 'verb' } );
		}

		return {
			callback: getActionCallback( { planSlug, cartItemForPlan, selectedStorageAddOn } ),
			status,
			text,
		};
	};
}

export default useGenerateAction;
