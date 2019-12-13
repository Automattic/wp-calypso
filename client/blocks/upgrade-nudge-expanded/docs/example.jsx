/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded';
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';

const UpgradeNudgeExpandedExample = () => {
	return (
		<div>
			<div>
				<UpgradeNudgeExpanded
					plan={ PLAN_BUSINESS }
					title={ 'Upgrade to a Business Plan and Enable Advanced SEO' }
					subtitle={
						"By upgrading to a Business Plan you'll enable advanced SEO features on your site."
					}
					highlightedFeature={ FEATURE_ADVANCED_SEO }
					benefits={ [
						"Preview your site's posts and pages as they will appear when shared on Facebook, Twitter and the WordPress.com Reader.",
						'Allow you to control how page titles will appear on Google search results, or when shared on social networks.',
						'Modify front page meta data in order to customize how your site appears to search engines.',
					] }
					forceDisplay
				/>
			</div>
		</div>
	);
};

UpgradeNudgeExpandedExample.displayName = 'UpgradeNudgeExpandedExample';

export default UpgradeNudgeExpandedExample;
