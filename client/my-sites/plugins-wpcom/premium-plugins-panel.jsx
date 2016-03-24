import React, { PropTypes } from 'react';

import FoldableCard from 'components/foldable-card';
import Gridicon from 'components/gridicon';

import PremiumPlugin from './plugin-types/premium-plugin';

const defaultPlugins = [
	{
		name: 'No Advertising',
		supportLink: 'https://en.support.wordpress.com/no-ads/',
		plan: 'Premium',
		description: 'Remove all ads from your site.'
	},
	{
		name: 'Custom Design',
		supportLink: 'https://en.support.wordpress.com/custom-design/',
		plan: 'Premium',
		description: 'With Customize you can personalize your blog\'s look and feel with intelligent color tools, custom fonts, and a CSS editor.'
	},
	{
		name: 'Video Uploads',
		supportLink: 'https://en.support.wordpress.com/videopress/',
		plan: 'Premium',
		description: 'Upload and host your video files on your site with VideoPress.'
	}
];

export const PremiumPluginsPanel = React.createClass( {
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
				className="wpcom-premium-plugins-panel"
				expanded={ true }
				header="Premium Upgrades"
			>
				{ plugins.map( ( { name, supportLink, icon, plan, description } ) =>
					<PremiumPlugin
						{ ...{ name, key: name, supportLink, icon, plan, description } }
					/>
				) }
			</FoldableCard>
		);
	}
} );

PremiumPluginsPanel.propTypes = {
	plugins: PropTypes.array
}

export default PremiumPluginsPanel;
