import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	applyTestFiltersToPlansList,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	getPlanPath,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { AddOns, Member, Plans } from '@automattic/data-stores';
import usePurchasesQueryKeysFactory from '@automattic/data-stores/src/purchases/queries/lib/use-query-keys-factory';
import { getUseSitePurchasesOptions } from '@automattic/data-stores/src/purchases/queries/use-site-purchases';
import useSiteQueryKeysFactory from '@automattic/data-stores/src/site/queries/lib/use-query-keys-factory';
import { getUseSiteUserQueryOptions } from '@automattic/data-stores/src/site/queries/use-site-user-query';
import { useStillNeedHelpURL } from '@automattic/help-center/src/hooks';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useTranslate, type LocalizeProps } from 'i18n-calypso';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import { cancelPurchase } from 'calypso/me/purchases/paths';
import { useFreeTrialPlanSlugs } from 'calypso/my-sites/plans-features-main/hooks/use-free-trial-plan-slugs';
import { useSelector } from 'calypso/state';
import { isCurrentUserCurrentPlanOwner } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isCurrentPlanPaid } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import useCurrentPlanManageHref from './use-current-plan-manage-href';
import type { PlansIntent, UseActionCallback } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function useUpgradeHandler( {
	siteSlug,
	withDiscount,
	cartHandler,
}: {
	siteSlug?: string | null;
	withDiscount?: string;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
} ) {
	const processCartItems = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null ) => {
			const cartItemForPlan = getPlanCartItem( cartItems );

			const cartItemForStorageAddOn = cartItems?.find(
				( items ) => items.product_slug === PRODUCT_1GB_SPACE
			);

			if ( cartItemForStorageAddOn?.extra ) {
				recordTracksEvent( 'calypso_signup_storage_add_on_upgrade_click', {
					add_on_slug: cartItemForStorageAddOn.extra.feature_slug,
				} );
			}

			if ( cartHandler ) {
				cartHandler( cartItems );
				return;
			}

			const planPath = cartItemForPlan?.product_slug
				? getPlanPath( cartItemForPlan.product_slug )
				: '';

			const checkoutUrl = cartItemForStorageAddOn
				? `/checkout/${ siteSlug }/${ planPath },${ cartItemForStorageAddOn.product_slug }:-q-${ cartItemForStorageAddOn.quantity }`
				: `/checkout/${ siteSlug }/${ planPath }`;

			const checkoutUrlWithArgs = addQueryArgs(
				{ ...( withDiscount && { coupon: withDiscount } ) },
				checkoutUrl
			);

			page( checkoutUrlWithArgs );
			return;
		},
		[ siteSlug, withDiscount, cartHandler ]
	);

	return useCallback(
		( {
			cartItemForPlan,
			selectedStorageAddOn,
		}: {
			cartItemForPlan?: MinimalRequestCartProduct | null;
			selectedStorageAddOn?: AddOns.AddOnMeta | null;
		} ) => {
			/* 1. Process plan and add-ons for checkout. */
			const storageAddOnCartItem = selectedStorageAddOn &&
				! selectedStorageAddOn.purchased && {
					product_slug: selectedStorageAddOn.productSlug,
					quantity: selectedStorageAddOn.quantity,
					volume: 1,
					// TODO: `feature_slug` below should be refactored to `add_on_slug` now that the two concepts are separated
					extra: { feature_slug: selectedStorageAddOn?.addOnSlug },
				};

			if ( cartItemForPlan ) {
				processCartItems?.( [
					cartItemForPlan,
					...( storageAddOnCartItem ? [ storageAddOnCartItem ] : [] ),
				] );
				return;
			}

			/* 2. Process free plan for checkout */
			processCartItems?.( null );
			return;
		},
		[ processCartItems ]
	);
}

function getOdieInitialPromptForPlan( {
	siteOwner,
	translate,
	availableForPurchase,
}: {
	siteOwner: Member;
	translate: LocalizeProps[ 'translate' ];
	// `availableForPurchase` is true for upgrades and false for downgrades
	availableForPurchase: boolean;
} ) {
	return `
${ translate( "Hello, I am Wapuu, WordPress.com's AI assistant!" ) }

${
	availableForPurchase
		? translate(
				"I noticed you're trying to upgrade your plan, but only the account owner can make these changes. The owner of this account is %(name)s (%(niceName)s).",
				{
					args: {
						name: siteOwner.name,
						niceName: siteOwner.nice_name,
					},
				}
		  )
		: translate(
				"I noticed you're trying to downgrade your plan, but only the account owner can make these changes. The owner of this account is %(name)s (%(niceName)s).",
				{
					args: {
						name: siteOwner.name,
						niceName: siteOwner.nice_name,
					},
				}
		  )
}

${
	availableForPurchase
		? translate(
				'If you need to upgrade, please reach out to %(name)s at %(email)s for help. They have the necessary permissions to make plan changes.',
				{
					args: {
						name: siteOwner.name,
						email: typeof siteOwner.email === 'string' ? siteOwner.email : '',
					},
				}
		  )
		: translate(
				'If you need to downgrade, please reach out to %(name)s at %(email)s for help. They have the necessary permissions to make plan changes.',
				{
					args: {
						name: siteOwner.name,
						email: typeof siteOwner.email === 'string' ? siteOwner.email : '',
					},
				}
		  )
}

${ translate(
	'Is there anything else I can help you with regarding your account? Please get in touch with our support team.'
) }
			`;
}

function useNonOwnerHandler( {
	siteId,
	currentPlan,
}: {
	siteId?: number | null;
	currentPlan: Plans.SitePlan | undefined;
} ) {
	const { setShowHelpCenter, setInitialRoute, setOdieBotNameSlug, setOdieInitialPromptText } =
		useDispatch( HELP_CENTER_STORE );
	const translate = useTranslate();

	const { url: stillNeedHelpUrl, isLoading: isStillNeedHelpUrlLoading } = useStillNeedHelpURL();
	const queryClient = useQueryClient();
	const purchasesQueryKeys = usePurchasesQueryKeysFactory();
	const siteQueryKeys = useSiteQueryKeysFactory();

	return useCallback(
		async ( { availableForPurchase }: { availableForPurchase?: boolean } ) => {
			const sitePurchases = await queryClient.ensureQueryData(
				getUseSitePurchasesOptions( { siteId }, purchasesQueryKeys.sitePurchases( siteId ) )
			);
			const currentSitePurchase = currentPlan?.purchaseId
				? sitePurchases[ currentPlan?.purchaseId ]
				: undefined;
			const siteOwner = await queryClient.ensureQueryData(
				getUseSiteUserQueryOptions(
					siteId,
					currentSitePurchase?.userId,
					siteQueryKeys.siteUser( siteId, currentSitePurchase?.userId )
				)
			);

			if ( isStillNeedHelpUrlLoading || ! siteOwner ) {
				return;
			}
			//open help
			setOdieBotNameSlug( 'wpcom-plan-support' );
			setOdieInitialPromptText(
				getOdieInitialPromptForPlan( {
					translate,
					siteOwner,
					availableForPurchase: !! availableForPurchase,
				} )
			);
			setInitialRoute( stillNeedHelpUrl );
			setShowHelpCenter( true );
			return;
		},
		[
			currentPlan?.purchaseId,
			isStillNeedHelpUrlLoading,
			purchasesQueryKeys,
			queryClient,
			setInitialRoute,
			setOdieBotNameSlug,
			setOdieInitialPromptText,
			setShowHelpCenter,
			siteId,
			siteQueryKeys,
			stillNeedHelpUrl,
			translate,
		]
	);
}

function useDowngradeHandler( {
	siteSlug,
	currentPlan,
}: {
	siteSlug?: string | null;
	siteId?: number | null;
	currentPlan: Plans.SitePlan | undefined;
} ) {
	const { setShowHelpCenter, setNavigateToRoute, setMessage } = useDispatch( HELP_CENTER_STORE );
	const translate = useTranslate();

	return useCallback(
		( planSlug: PlanSlug ) => {
			if ( ! siteSlug || ! currentPlan?.planSlug ) {
				return;
			}

			// A downgrade to the free plan is essentially cancelling the current plan.
			if ( isFreePlan( planSlug ) ) {
				page( cancelPurchase( siteSlug, currentPlan?.purchaseId ) );
				return;
			}

			const chatUrl = `/contact-form?${ new URLSearchParams( {
				mode: 'CHAT',
				'disable-gpt': 'true',
				'skip-resources': 'true',
			} ).toString() }`;
			setMessage( translate( 'I want to downgrade my plan.' ) );
			setNavigateToRoute( chatUrl );
			setShowHelpCenter( true );
		},
		[
			currentPlan?.planSlug,
			currentPlan?.purchaseId,
			setNavigateToRoute,
			setMessage,
			setShowHelpCenter,
			siteSlug,
			translate,
		]
	);
}

function useGenerateActionCallback( {
	currentPlan,
	eligibleForFreeHostingTrial,
	cartHandler,
	flowName,
	intent,
	showModalAndExit,
	sitePlanSlug,
	siteId,
	withDiscount,
}: {
	currentPlan: Plans.SitePlan | undefined;
	eligibleForFreeHostingTrial: boolean;
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void;
	flowName?: string | null;
	intent?: PlansIntent | null;
	showModalAndExit?: ( planSlug: PlanSlug ) => boolean;
	sitePlanSlug?: PlanSlug | null;
	siteId?: number | null;
	withDiscount?: string;
} ): UseActionCallback {
	const siteSlug = useSelector( ( state: IAppState ) => getSiteSlug( state, siteId ) );
	const freeTrialPlanSlugs = useFreeTrialPlanSlugs( {
		intent: intent ?? 'default',
		eligibleForFreeHostingTrial,
	} );
	const currentPlanManageHref = useCurrentPlanManageHref();
	const canUserManageCurrentPlan = useSelector( ( state: IAppState ) =>
		siteId
			? ! isCurrentPlanPaid( state, siteId ) || isCurrentUserCurrentPlanOwner( state, siteId )
			: null
	);
	const handleUpgradeClick = useUpgradeHandler( { siteSlug, withDiscount, cartHandler } );
	const handleDowngradeClick = useDowngradeHandler( {
		siteSlug,
		currentPlan,
		siteId,
	} );
	const handleNonOwnerClick = useNonOwnerHandler( { siteId, currentPlan } );

	const [ isLoading, setIsLoading ] = useState( false );

	return {
		isLoading,
		getActionCallback: ( {
			planSlug,
			cartItemForPlan,
			selectedStorageAddOn,
			availableForPurchase,
		} ) => {
			return async () => {
				const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
				const freeTrialPlanSlug = freeTrialPlanSlugs?.[ planConstantObj.type ];

				const earlyReturn = showModalAndExit?.( planSlug );
				if ( earlyReturn ) {
					return;
				}

				/* 1. Send user to VIP if it's an enterprise plan */
				if ( isWpcomEnterpriseGridPlan( planSlug ) ) {
					recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
					const vipLandingPageURL = 'https://wpvip.com/wordpress-vip-agile-content-platform';
					window.open(
						`${ vipLandingPageURL }/?utm_source=WordPresscom&utm_medium=automattic_referral&utm_campaign=calypso_signup`,
						'_blank'
					);
				}

				/* 2. In the logged-in plans dashboard, send user to either manage add-ons or manage plan in case of current plan selection */
				if (
					sitePlanSlug &&
					currentPlan?.productSlug === planSlug &&
					! flowName &&
					intent !== 'plans-p2' &&
					intent !== 'plans-blog-onboarding'
				) {
					if ( isFreePlan( planSlug ) ) {
						page.redirect( `/add-ons/${ siteSlug }` );
					} else {
						page.redirect( currentPlanManageHref );
					}
					return;
				}

				if (
					sitePlanSlug &&
					! flowName &&
					intent !== 'plans-p2' &&
					intent !== 'plans-blog-onboarding' &&
					! canUserManageCurrentPlan
				) {
					setIsLoading( true );
					await handleNonOwnerClick( { availableForPurchase } );
					setIsLoading( false );
					return;
				}

				/* 3. In the logged-in plans dashboard, handle plan downgrades and plan downgrade tracks events */
				if (
					sitePlanSlug &&
					! flowName &&
					intent !== 'plans-p2' &&
					intent !== 'plans-blog-onboarding' &&
					! availableForPurchase
				) {
					recordTracksEvent?.( 'calypso_plan_features_downgrade_click', {
						current_plan: sitePlanSlug,
						downgrading_to: planSlug,
					} );
					handleDowngradeClick( planSlug );
					return;
				}

				/* 4. Handle plan upgrade and plan upgrade tracks events */
				if ( isFreePlan( planSlug ) ) {
					recordTracksEvent( 'calypso_signup_free_plan_click' );
				} else {
					recordTracksEvent?.( 'calypso_plan_features_upgrade_click', {
						current_plan: sitePlanSlug,
						upgrading_to: planSlug,
						saw_free_trial_offer: !! freeTrialPlanSlug,
					} );
				}
				handleUpgradeClick( {
					cartItemForPlan,
					selectedStorageAddOn,
				} );
				return;
			};
		},
	};
}

export default useGenerateActionCallback;
