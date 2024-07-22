import {
	findFirstSimilarPlanKey,
	TYPE_PREMIUM,
	PLAN_PREMIUM,
	getPlan,
	PlanSlug,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';

interface Props {
	siteId?: number | null;
}

export const UpgradeToPremiumNudge = ( { siteId }: Props ) => {
	const translate = useTranslate();
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const canUserUpgrade = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);

	const proposedPlanSlug =
		currentPlan?.planSlug &&
		findFirstSimilarPlanKey( currentPlan?.planSlug, { type: TYPE_PREMIUM } );

	const pricing = Plans.usePricingMetaForGridPlans( {
		siteId,
		planSlugs: [ proposedPlanSlug as PlanSlug ],
		storageAddOns: null,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ proposedPlanSlug as PlanSlug ];

	const price = pricing?.discountedPrice.monthly ?? pricing?.originalPrice.monthly;

	const hasEnTranslation = useHasEnTranslation();
	const featureList = [
		translate( 'Share posts that have already been published.' ),
		translate( 'Schedule your social messages in advance.' ),
		translate( 'Remove all advertising from your site.' ),
		hasEnTranslation( 'Enjoy fast support.' )
			? translate( 'Enjoy fast support.' )
			: translate( 'Enjoy live chat support.' ),
		translate( 'Easy monetization options' ),
	];

	if ( ! canUserUpgrade || typeof price !== 'number' || ! pricing?.currencyCode ) {
		return null;
	}

	return (
		<UpsellNudge
			className="post-share__actions-list-upgrade-nudge"
			callToAction={ translate( 'Upgrade for %s', {
				args: formatCurrency( price, pricing?.currencyCode, {
					isSmallestUnit: true,
				} ),
				comment: '%s will be replaced by a formatted price, i.e $9.99',
			} ) }
			forceDisplay
			list={ featureList }
			plan={ proposedPlanSlug }
			showIcon
			title={
				/* translators: %(planName)s is the short-hand version of the Personal plan name */
				translate( 'Upgrade to a %(planName)s Plan!', {
					args: { planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '' },
				} )
			}
			event="post_share_plan_upgrade_nudge"
		/>
	);
};
