import React from 'react';
import noop from 'lodash/noop';

import HeaderCake from 'components/header-cake';

import StandardPluginsPanel from './standard-plugins-panel';

export const PluginsList = React.createClass( {
	render() {
		/* development-only code - don't deploy! */
		const siteSlug = window.location.pathname.split( '/' ).pop();
		const backHref = `/plugins/${ siteSlug }`;
		/* end development-only section */

		return (
			<div className="wpcom-plugins-list">
				<HeaderCake backHref={ backHref } onClick={ noop }>Standard Plugins</HeaderCake>
				<StandardPluginsPanel />
			</div>
		);
	}
} );

export default PluginsList;
