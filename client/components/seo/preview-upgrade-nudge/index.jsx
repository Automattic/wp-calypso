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
import FeatureExample from 'components/feature-example';
import Banner from 'components/banner';
import { findSimilarPlan } from '../../../lib/plans';
import { TYPE_BUSINESS } from '../../../lib/plans/constants';
import { getCurrentPlan } from '../../../state/sites/plans/selectors';

const SeoPreviewNudge = ( { translate, currentPlan } ) => {
	return (
		<div className="preview-upgrade-nudge">
			<QueryPlans />
			<TrackComponentView eventName="calypso_seo_preview_upgrade_nudge_impression" />

			<Banner
				plan={ findSimilarPlan( currentPlan, { type: TYPE_BUSINESS } ) }
				title={ translate( 'Upgrade to a Business Plan to unlock the power of our SEO tools!' ) }
				event="site_preview_seo_plan_upgrade"
				className="preview-upgrade-nudge__banner"
			/>

			<div className="preview-upgrade-nudge__features">
				<FeatureExample>
					<img src="/calypso/images/advanced-seo-nudge.png" />
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

const mapStateToProps = ( state, { site } ) => {
	return {
		plan: getCurrentPlan( state, site.ID ),
	};
};

export default connect( mapStateToProps )( localize( SeoPreviewNudge ) );
