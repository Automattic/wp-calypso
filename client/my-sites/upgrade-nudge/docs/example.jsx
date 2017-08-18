/**
 * External dependencies
 */
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
					shouldDisplay={ () => true }
				/>
			</div>
			<div>
				<UpgradeNudge
					title="This is a title"
					message="This is a custom message"
					icon="customize"
					shouldDisplay={ () => true }
					compact
				/>
			</div>
		</div>
	);
};

UpgradeNudgeExample.displayName = 'UpgradeNudge';

export default UpgradeNudgeExample;
