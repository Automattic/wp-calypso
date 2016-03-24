import React from 'react';

import InfoHeader from './info-header';
import StandardPluginsPanel from './standard-plugins-panel';
import PremiumPluginsPanel from './premium-plugins-panel';
import BusinessPluginsPanel from './business-plugins-panel';

export const PluginPanel = React.createClass( {
	render() {
		return (
			<div className="wpcom-plugin-panel">
				<InfoHeader />
				<StandardPluginsPanel />
				<PremiumPluginsPanel />
				<BusinessPluginsPanel />
			</div>
		);
	}
} );

export default PluginPanel;
