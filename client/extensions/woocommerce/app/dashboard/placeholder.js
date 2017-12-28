/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import BasicWidget from 'client/extensions/woocommerce/components/basic-widget';
import WidgetGroup from 'client/extensions/woocommerce/components/widget-group';

const DashboardPlaceholder = () => {
	const loading = <BasicWidget title="…" className="dashboard__placeholder-small" />;

	return (
		<div className="dashboard__placeholder">
			<BasicWidget className="dashboard__placeholder-large card" />
			<WidgetGroup>
				{ loading }
				{ loading }
			</WidgetGroup>
		</div>
	);
};

export default DashboardPlaceholder;
