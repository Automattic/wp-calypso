import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	findFirstSimilarPlanKey,
	TYPE_PREMIUM,
	TERM_ANNUALLY,
	TYPE_SECURITY_T1,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ExternalLink from 'calypso/components/external-link';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import {
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'calypso/state/sites/plans/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const UpgradeToPremiumNudgePure = ( props ) => {
	const { price, planSlug, siteSlug, translate, userCurrency, canUserUpgrade, isJetpack } = props;

	let featureList;
	if ( isJetpack ) {
		featureList = [
			translate( 'Share posts that have already been published.' ),
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Plus all the additional features included with Jetpack Security, such as:.' ),
			translate( 'Real-time cloud backups.' ),
			translate( 'Real-time malware scanning.' ),
			translate( 'Comment and form spam protection.' ),
		];
	} else {
		featureList = [
			translate( 'Share posts that have already been published.' ),
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Remove all advertising from your site.' ),
			translate( 'Enjoy live chat support.' ),
			translate( 'Easy monetization options' ),
		];
	}

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
				isJetpack
					? translate( 'Upgrade to Jetpack Security to unlock additional features.' )
					: translate( 'Upgrade to a Premium Plan!' )
			}
			{ ...( isJetpack && {
				description: translate(
					"Publicize makes it easy to share your site's posts on several social media networks automatically when you publish a new post. However, our Security and Complete plan users can also share content that has already been published, and schedule their posts to be shared at a specific time. {{ExternalLink}}Learn more{{/ExternalLink}}",
					{
						components: {
							ExternalLink: (
								<ExternalLink
									href={ `https://jetpack.com/support/publicize/#re-sharing-your-content` }
									icon={ true }
									onClick={ () =>
										recordTracksEvent( 'calypso_publicize_post_share_learn_more_click' )
									}
								/>
							),
						},
					}
				),
				href: `/checkout/${ siteSlug }/jetpack_security_t1_yearly`,
			} ) }
		/>
	);
};

const getDiscountedOrRegularPrice = ( state, siteId, plan ) =>
	getPlanDiscountedRawPrice( state, siteId, plan, { isMonthly: true } ) ||
	getSitePlanRawPrice( state, siteId, plan, { isMonthly: true } );

export const UpgradeToPremiumNudge = connect( ( state, ownProps ) => {
	const { isJetpack, siteId } = ownProps;
	const currentPlanSlug = ( getSitePlan( state, getSelectedSiteId( state ) ) || {} ).product_slug;
	const proposedPlan = findFirstSimilarPlanKey( currentPlanSlug, {
		type: isJetpack ? TYPE_SECURITY_T1 : TYPE_PREMIUM,
		...( isJetpack ? { term: TERM_ANNUALLY } : {} ),
	} );

	return {
		planSlug: proposedPlan,
		price: getDiscountedOrRegularPrice( state, siteId, proposedPlan ),
		canUserUpgrade: canCurrentUser( state, siteId, 'manage_options' ),
	};
} )( UpgradeToPremiumNudgePure );
