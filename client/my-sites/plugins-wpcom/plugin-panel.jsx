import React from 'react';

import Card from 'components/card';

import InfoHeader from './info-header';
import StandardPluginsPanel from './standard-plugins-panel';
import PremiumPluginsPanel from './premium-plugins-panel';
import BusinessPluginsPanel from './business-plugins-panel';

export const PluginPanel = React.createClass( {
	render() {
		/* For development purposes only */
		const siteSlug = window.location.pathname.split( '/' ).pop();
		const standardPluginsLink = `/plugins/standard/${ siteSlug }`;
		/* End development section */

		return (
			<div className="wpcom-plugin-panel">
				<InfoHeader />
				<StandardPluginsPanel />
				<Card className="wpcom-plugin-panel__panel-footer" href={ standardPluginsLink }>
					{ this.translate( 'View all standard plugins' ) }
				</Card>
				<PremiumPluginsPanel />
				<BusinessPluginsPanel />
			</div>
		);
	}
} );

export default PluginPanel;
