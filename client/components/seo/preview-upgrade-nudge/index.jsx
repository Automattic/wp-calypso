/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import QueryPlans from 'components/data/query-plans';
import TrackComponentView from 'lib/analytics/track-component-view';
import { preventWidows } from 'lib/formatting';
import { isJetpackSite } from 'state/sites/selectors';
import FeatureExample from 'components/feature-example';
import Banner from 'components/banner';
import { findFirstSimilarPlanKey } from 'lib/plans';
import { TERM_ANNUALLY, TYPE_BUSINESS } from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './style.scss';
import upgradeNudgeImage from './preview-upgrade-nudge.png';

export const SeoPreviewNudge = ( { translate, site, isJetpack = false } ) => {
	return (
		<div className="preview-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_preview_upgrade_nudge_impression" />

			<Banner
				plan={
					site &&
					findFirstSimilarPlanKey( site.plan.product_slug, {
						type: TYPE_BUSINESS,
						...( isJetpack ? { term: TERM_ANNUALLY } : {} ),
					} )
				}
				title={ translate( 'Upgrade to a Business Plan to unlock the power of our SEO tools!' ) }
				event="site_preview_seo_plan_upgrade"
				className="preview-upgrade-nudge__banner"
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
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
