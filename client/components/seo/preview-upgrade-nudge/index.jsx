import config from '@automattic/calypso-config';
import {
	findFirstSimilarPlanKey,
	TERM_ANNUALLY,
	TYPE_BUSINESS,
	TYPE_SECURITY_DAILY,
	FEATURE_SEO_PREVIEW_TOOLS,
	PLAN_BUSINESS,
	getPlan,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryProducts from 'calypso/components/data/query-products-list';
import FeatureExample from 'calypso/components/feature-example';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { addQueryArgs } from 'calypso/lib/url';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import upgradeNudgeImage from './preview-upgrade-nudge.webp';

import './style.scss';

// In wp-admin (Odyssey) UpsellNudge's default Calypso-relative /plans link
// would resolve against the site's own domain and 404, so link to
// wordpress.com absolutely there; elsewhere the default is correct.
export const getUpgradeNudgeHref = ( { isOdyssey, siteSlug, plan } ) =>
	isOdyssey && siteSlug
		? addQueryArgs(
				{ feature: FEATURE_SEO_PREVIEW_TOOLS, plan },
				`https://wordpress.com/plans/${ siteSlug }`
		  )
		: undefined;

export const SeoPreviewNudge = ( {
	canCurrentUserUpgrade,
	translate,
	site,
	siteSlug,
	isJetpack = false,
} ) => {
	const planName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
	const plan =
		site &&
		findFirstSimilarPlanKey(
			site.plan.product_slug,
			isJetpack ? { type: TYPE_SECURITY_DAILY, term: TERM_ANNUALLY } : { type: TYPE_BUSINESS }
		);
	return (
		<div className="preview-upgrade-nudge">
			{ /** QueryProducts added to ensure currency-code state gets populated for usages of getCurrentUserCurrencyCode */ }
			<QueryProducts />
			<TrackComponentView eventName="calypso_seo_preview_upgrade_nudge_impression" />

			<UpsellNudge
				showIcon
				plan={ plan }
				href={ getUpgradeNudgeHref( {
					isOdyssey: config.isEnabled( 'is_odyssey' ),
					siteSlug,
					plan,
				} ) }
				title={
					canCurrentUserUpgrade
						? translate( 'Upgrade to a %(planName)s plan to unlock the power of our SEO tools!', {
								args: { planName },
						  } )
						: translate(
								"Unlock powerful SEO tools! Contact your site's administrator to upgrade to a %(planName)s plan.",
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
							{ translate(
								"Preview your site's content as it will appear on Facebook, Twitter, and the WordPress.com Reader."
							) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon
								className="preview-upgrade-nudge__features-list-item-checkmark"
								icon="checkmark"
							/>
							{ translate(
								'Control how page titles will appear on Google search results and social networks.'
							) }
						</li>
						<li className="preview-upgrade-nudge__features-list-item">
							<Gridicon
								className="preview-upgrade-nudge__features-list-item-checkmark"
								icon="checkmark"
							/>
							{ translate(
								'Customize your front page meta data to change how your site appears to search engines.'
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
		siteSlug: getSiteSlug( state, site.ID ),
		canCurrentUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
