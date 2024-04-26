import { type PlanSlug, isFreePlan } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import useGenerateActionCallback from './use-action-callback';
import type {
	PlanActionOverrides,
	PlansIntent,
	UseActionCallback,
} from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useActions( {
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
} ): { useActionCallback: UseActionCallback } {
	const useActionCallback = useGenerateActionCallback( {
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

	const actions = useMemo( () => {
		let actions: PlanActionOverrides = {
			currentPlan: {},
			loggedInFreePlan: {},
			trialAlreadyUsed: {},
		};

		/* 1. Onboarding actions */
		if ( isInSignup ) {
			actions = {
				loggedInFreePlan: {
					status: 'enabled',
				},
			};

			if ( ! eligibleForFreeHostingTrial && intentFromProps === 'plans-new-hosted-site' ) {
				actions.trialAlreadyUsed = {
					postButtonText: translate( "You've already used your free trial! Thanks!" ),
				};
			}
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
	}, [
		eligibleForFreeHostingTrial,
		isInSignup,
		sitePlanSlug,
		intentFromProps,
		translate,
		domainFromHomeUpsellFlow,
		canUserManageCurrentPlan,
	] );

	return {
		useActionCallback,
		...actions,
	};
}

export default useActions;
