/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import UpgradeNudge from 'blocks/upgrade-nudge';
import { FEATURE_CUSTOM_DOMAIN } from 'lib/plans/constants';

const UpgradeNudgeExample = () => {
	return (
		<div>
			<div>
				<UpgradeNudge feature={ FEATURE_CUSTOM_DOMAIN } href="#" forceDisplay />
			</div>
			<div>
				<UpgradeNudge
					title="This is a title"
					message="This is a custom message"
					icon="customize"
					forceDisplay
					compact
				/>
			</div>
		</div>
	);
};

UpgradeNudgeExample.displayName = 'UpgradeNudgeExample';

export default UpgradeNudgeExample;
