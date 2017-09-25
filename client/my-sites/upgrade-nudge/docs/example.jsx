/**
 * External dependencies
 */
import { stubTrue } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import UpgradeNudge from 'my-sites/upgrade-nudge';

const UpgradeNudgeExample = () => {
	return (
		<div>
			<div>
				<UpgradeNudge
					feature="custom-domain"
					href="#"
					shouldDisplay={ stubTrue }
				/>
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
