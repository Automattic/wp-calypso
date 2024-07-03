import {
	findFirstSimilarPlanKey,
	TYPE_PREMIUM,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const UpgradeToPremiumNudgePure = ( props ) => {
	const { price, planSlug, translate, userCurrency, canUserUpgrade } = props;

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

	if ( ! canUserUpgrade ) {
		return null;
	}

	return (
		<UpsellNudge
			className="post-share__actions-list-upgrade-nudge"
			callToAction={ translate( 'Upgrade for %s', {
				args: formatCurrency( price, userCurrency ),
				comment: '%s will be replaced by a formatted price, i.e $9.99',
			} ) }
			forceDisplay
			list={ featureList }
			plan={ planSlug }
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

const getDiscountedOrRegularPrice = ( state, siteId, plan ) =>
	getPlanDiscountedRawPrice( state, siteId, plan, { returnMonthly: true } ) ||
	getSitePlanRawPrice( state, siteId, plan, { returnMonthly: true } );

export const UpgradeToPremiumNudge = connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	const currentPlanSlug = ( getSitePlan( state, getSelectedSiteId( state ) ) || {} ).product_slug;
	const proposedPlan = findFirstSimilarPlanKey( currentPlanSlug, { type: TYPE_PREMIUM } );

	return {
		planSlug: proposedPlan,
		price: getDiscountedOrRegularPrice( state, siteId, proposedPlan ),
		canUserUpgrade: canCurrentUser( state, siteId, 'manage_options' ),
	};
} )( UpgradeToPremiumNudgePure );
