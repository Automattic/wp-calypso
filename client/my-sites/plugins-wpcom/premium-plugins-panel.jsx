import React, { PropTypes } from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';
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
		description: 'Customize your blog\'s look with custom fonts, a CSS editor, and more.'
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
		const { plugins: givenPlugins = [] } = this.props;
		const plugins = givenPlugins.length
			? givenPlugins
			: defaultPlugins;
		const actionButton = <div><Gridicon icon="checkmark" /> Active</div>;

		return (
			<div>
			<SectionHeader label={ this.translate( 'Premium Upgrades' ) }>
				<Button compact primary>
					{ this.translate( 'Purchase' ) }
				</Button>
			</SectionHeader>
			<Card className="wpcom-plugins__premium-panel">
				<div className="wpcom-plugins__list">
					{ plugins.map( ( { name, supportLink, icon, plan, description } ) =>
						<PremiumPlugin
							{ ...{ name, key: name, supportLink, icon, plan, description } }
							/>
					) }
				</div>
			</Card>
			</div>
		);
	}
} );

PremiumPluginsPanel.propTypes = {
	plugins: PropTypes.array
};

export default PremiumPluginsPanel;
