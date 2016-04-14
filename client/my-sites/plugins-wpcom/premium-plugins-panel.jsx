import React, { PropTypes } from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

import PremiumPlugin from './plugin-types/premium-plugin';

const defaultPlugins = [
	{
		name: 'No Advertising',
		descriptionLink: 'https://en.support.wordpress.com/no-ads/',
		icon: 'block',
		plan: 'Premium',
		description: 'Remove all ads from your site.'
	},
	{
		name: 'Custom Design',
		descriptionLink: 'https://en.support.wordpress.com/custom-design/',
		icon: 'customize',
		plan: 'Premium',
		description: 'Customize your blog\'s look with custom fonts, a CSS editor, and more.'
	},
	{
		name: 'Video Uploads',
		descriptionLink: 'https://en.support.wordpress.com/videopress/',
		icon: 'video-camera',
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

		return (
			<div>
				<SectionHeader label={ this.translate( 'Premium Plan Upgrades' ) }>
					<Button compact primary>{ this.translate( 'Purchase' ) }</Button>
				</SectionHeader>
				<Card className="wpcom-plugins__premium-panel is-disabled">
					<div className="wpcom-plugins__list">
						{ plugins.map( ( { name, descriptionLink, icon, plan, description } ) =>
							<PremiumPlugin
								{ ...{ name, key: name, descriptionLink, icon, plan, description } }
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
