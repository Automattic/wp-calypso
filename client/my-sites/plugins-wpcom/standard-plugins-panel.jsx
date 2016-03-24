import React, { PropTypes } from 'react';

import FoldableCard from 'components/foldable-card';
import Gridicon from 'components/gridicon';

import StandardPlugin from './plugin-types/standard-plugin';

const defaultPlugins = [
	{
		name: 'WordPress.com Stats',
		supportLink: 'http://support.wordpress.com/stats/',
		category: 'Traffic Growth',
		description: 'View your site\'s visits, referrers, and more.'
	},
	{
		name: 'Essential SEO',
		supportLink: 'http://en.blog.wordpress.com/2013/03/22/seo-on-wordpress-com/',
		category: 'Traffic Growth',
		description: 'Search engine optimization and sitemaps.'
	},
	{
		name: 'Security Scanning',
		supportLink: 'http://support.wordpress.com/security/',
		category: 'Performance',
		description: 'Constant monitoring of your site for threats.'
	},
	{
		name: 'Advanced Galleries',
		supportLink: 'http://support.wordpress.com/images/gallery/',
		category: 'Appearance',
		description: 'Tiled, mosaic, slideshows, and more.'
	},
	{
		name: 'Social Media Sharing',
		supportLink: 'http://support.wordpress.com/sharing/',
		category: 'Traffic Growth',
		description: 'Add share buttons to your posts and pages.'
	},
	{
		name: 'Contact Form Builder',
		supportLink: 'http://support.wordpress.com/contact-form/',
		category: 'Appearance',
		description: 'Build contact forms so visitors can get in touch.'
	},
	{
		name: 'Extended Customizer',
		supportLink: 'https://en.support.wordpress.com/customizer/',
		category: 'Appearance',
		description: 'Edit colors and backgrounds.'
	}
];

export const StandardPluginsPanel = React.createClass( {
	render() {
		const { plugins: givenPlugins  = [] } = this.props;
		const plugins = givenPlugins.length
			? givenPlugins
			: defaultPlugins;
		const actionButton = <div className="wpcom-stanard-plugins-panel__action-button"><Gridicon icon="checkmark" /> Active</div>;

		return (
			<FoldableCard
				actionButton={ actionButton }
				actionButtonExpanded={ actionButton }
				className="wpcom-standard-plugins-panel"
				expanded={ true }
				header="Standard Plugin Suite"
			>
				{ plugins.map( ( { name, supportLink, icon, category, description } ) =>
					<StandardPlugin
						{ ...{ name, key: name, supportLink, icon, category, description } }
					/>
				) }
				<div>
					<Gridicon icon="plus" />View all standard plugins
				</div>
			</FoldableCard>
		);
	}
} );

StandardPluginsPanel.propTypes = {
	plugins: PropTypes.array
}

export default StandardPluginsPanel;
