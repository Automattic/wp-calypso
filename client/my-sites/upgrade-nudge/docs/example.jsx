/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { FEATURE_CUSTOM_DOMAIN } from 'lib/plans/constants';

const UpgradeNudgeExample = () => {
	return (
		<div>
			<div>
				<UpgradeNudge feature={ FEATURE_CUSTOM_DOMAIN } href="#" shouldDisplay={ stubTrue } />
			</div>
			<div>
				<UpgradeNudge
					title="This is a title"
					message="This is a custom message"
					icon="customize"
					shouldDisplay={ stubTrue }
					compact
				/>
			</div>
		</div>
	);
};

UpgradeNudgeExample.displayName = 'UpgradeNudgeExample';

export default UpgradeNudgeExample;
