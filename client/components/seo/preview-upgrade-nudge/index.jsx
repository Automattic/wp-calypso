import {
	isWpComAnnualPlan,
	findFirstSimilarPlanKey,
	TERM_ANNUALLY,
	TYPE_PRO,
	TYPE_BUSINESS,
	TYPE_SECURITY_DAILY,
	FEATURE_SEO_PREVIEW_TOOLS,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryPlans from 'calypso/components/data/query-plans';
import FeatureExample from 'calypso/components/feature-example';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { preventWidows } from 'calypso/lib/formatting';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import upgradeNudgeImage from './preview-upgrade-nudge.png';

import './style.scss';

export const SeoPreviewNudge = ( {
	canCurrentUserUpgrade,
	translate,
	site,
	isJetpack = false,
} ) => {
	const upsellType = site && isWpComAnnualPlan( site.plan.product_slug ) ? TYPE_PRO : TYPE_BUSINESS;
	const planName =
		upsellType === TYPE_PRO ? translate( 'a Pro plan' ) : translate( 'a Business plan' );

	return (
		<div className="preview-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_preview_upgrade_nudge_impression" />

			<UpsellNudge
				showIcon
				plan={
					site &&
					findFirstSimilarPlanKey(
						site.plan.product_slug,
						isJetpack ? { type: TYPE_SECURITY_DAILY, term: TERM_ANNUALLY } : { type: upsellType }
					)
				}
				title={
					canCurrentUserUpgrade
						? translate( 'Upgrade to %(planName)s to unlock the power of our SEO tools!', {
								args: { planName },
						  } )
						: translate(
								"Unlock powerful SEO tools! Contact your site's administrator to upgrade to %(planName)s.",
								{ args: { planName } }
						  )
				}
				forceDisplay
				disableHref={ ! canCurrentUserUpgrade }
				event="site_preview_seo_plan_upgrade"
				className="preview-upgrade-nudge__banner"
				feature={ FEATURE_SEO_PREVIEW_TOOLS }
			/>

			<div className="preview-upgrade-nudge__features">
				<FeatureExample>
					<img src={ upgradeNudgeImage } alt="" />
				</FeatureExample>
				<div className="preview-upgrade-nudge__features-details">
					<ul className="preview-upgrade-nudge__features-list">
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon
								className="preview-upgrade-nudge__features-list-item-checkmark"
								icon="checkmark"
							/>
							{ preventWidows(
								translate(
									"Preview your site's content as it will appear on Facebook, Twitter, and the WordPress.com Reader."
								)
							) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon
								className="preview-upgrade-nudge__features-list-item-checkmark"
								icon="checkmark"
							/>
							{ preventWidows(
								translate(
									'Control how page titles will appear on Google search results and social networks.'
								)
							) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon
								className="preview-upgrade-nudge__features-list-item-checkmark"
								icon="checkmark"
							/>
							{ preventWidows(
								translate(
									'Customize your front page meta data to change how your site appears to search engines.'
								)
							) }
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

SeoPreviewNudge.propTypes = {
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, ownProps ) => {
	const { site } = ownProps;
	const isJetpack = isJetpackSite( state, site.ID );

	return {
		isJetpack,
		canCurrentUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
