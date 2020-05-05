/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import WidgetRow from 'woocommerce/components/dashboard-widget/row';

const DashboardPlaceholder = () => {
	const loading = <div title="…" className="dashboard__placeholder-small dashboard-widget card" />;

	return (
		<div className="dashboard__placeholder">
			<div className="dashboard__placeholder-large card dashboard-widget" />
			<WidgetRow>
				{ loading }
				{ loading }
			</WidgetRow>
		</div>
	);
};

export default DashboardPlaceholder;
