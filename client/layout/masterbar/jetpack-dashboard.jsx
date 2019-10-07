/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Item from './item';
import JetpackLogo from 'components/jetpack-logo';
import Masterbar from './masterbar';

const JetpackDashboardMasterbar = () => (
	<Masterbar>
		<Item className="masterbar__item-logo">
			<JetpackLogo className="masterbar__jetpack-logo" full />
		</Item>
	</Masterbar>
);

export default JetpackDashboardMasterbar;
