import React, { PropTypes } from 'react';

import FoldableCard from 'components/foldable-card';
import Gridicon from 'components/gridicon';

import BusinessPlugin from './plugin-types/business-plugin';

const defaultPlugins = [
	{
		name: 'Google Analytics',
		supportLink: 'https://en.support.wordpress.com/google-analytics/',
		plan: 'Business',
		description: (
			<div>
				Advanced features to complement <a href="http://wordpress.com/">WordPress.com stats</a>.
				Funnel reports, goal conversion, and more.
			</div>
		)
	}
];

export const BusinessPluginsPanel = React.createClass( {
	render() {
		const { plugins: givenPlugins  = [] } = this.props;
		const plugins = givenPlugins.length
			? givenPlugins
			: defaultPlugins;
		const actionButton = <div><Gridicon icon="checkmark" /> Active</div>;

		return (
			<FoldableCard
				actionButton={ actionButton }
				actionButtonExpanded={ actionButton }
				className="wpcom-business-plugins-panel"
				expanded={ true }
				header="Business Upgrades"
			>
				{ plugins.map( ( { name, supportLink, icon, plan, description } ) =>
					<BusinessPlugin
						{ ...{ name, key: name, supportLink, icon, plan, description } }
					/>
				) }
			</FoldableCard>
		);
	}
} );

BusinessPluginsPanel.propTypes = {
	plugins: PropTypes.array
}

export default BusinessPluginsPanel;
