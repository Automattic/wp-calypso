import { type Member, type Plans } from '@automattic/data-stores';
import usePurchasesQueryKeysFactory from '@automattic/data-stores/src/purchases/queries/lib/use-query-keys-factory';
import { getUseSitePurchasesOptions } from '@automattic/data-stores/src/purchases/queries/use-site-purchases';
import useSiteQueryKeysFactory from '@automattic/data-stores/src/site/queries/lib/use-query-keys-factory';
import { getUseSiteUserQueryOptions } from '@automattic/data-stores/src/site/queries/use-site-user-query';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { useTranslate, type LocalizeProps } from 'i18n-calypso';

export function useNonOwnerHandler( {
	siteId,
	currentPlan,
}: {
	siteId?: number | null;
	currentPlan: Plans.SitePlan | undefined;
} ) {
	const { setShowHelpCenter, setNavigateToRoute, setOdieBotNameSlug, setOdieInitialPromptText } =
		useDispatch( HELP_CENTER_STORE );
	const translate = useTranslate();

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

			if ( ! siteOwner ) {
				return;
			}

			setOdieBotNameSlug( 'wpcom-plan-support' );
			setOdieInitialPromptText(
				getOdieInitialPromptForPlan( {
					translate,
					siteOwner,
					availableForPurchase: !! availableForPurchase,
				} )
			);
			setNavigateToRoute( '/odie' );
			setShowHelpCenter( true );
			return;
		},
		[
			currentPlan?.purchaseId,
			purchasesQueryKeys,
			queryClient,
			setNavigateToRoute,
			setOdieBotNameSlug,
			setOdieInitialPromptText,
			setShowHelpCenter,
			siteId,
			siteQueryKeys,
			translate,
		]
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
				"I noticed you're trying to upgrade your plan, but only the plan owner can make these changes. The owner of this plan is %(name)s (%(niceName)s).",
				{
					args: {
						name: siteOwner.name,
						niceName: siteOwner.nice_name,
					},
				}
		  )
		: translate(
				"I noticed you're trying to downgrade your plan, but only the plan owner can make these changes. The owner of this plan is %(name)s (%(niceName)s).",
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
