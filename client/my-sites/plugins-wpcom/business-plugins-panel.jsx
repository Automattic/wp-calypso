import React, { PropTypes } from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

import BusinessPlugin from './plugin-types/business-plugin';

const defaultPlugins = [
	{
		name: 'Google Analytics',
		supportLink: 'https://en.support.wordpress.com/google-analytics/',
		icon: 'stats',
		plan: 'Business',
		description: 'Advanced features to complement WordPress.com stats. Funnel reports, goal conversion, and more.'
	}
];

export const BusinessPluginsPanel = React.createClass( {
	render() {
		const { plugins: givenPlugins = [] } = this.props;
		const plugins = givenPlugins.length
			? givenPlugins
			: defaultPlugins;

		return (
			<div>
				<SectionHeader label={ this.translate( 'Business Plan Upgrades' ) }>
					<Button compact primary>{ this.translate( 'Purchase' ) }</Button>
				</SectionHeader>
				<Card className="wpcom-plugins__business-panel is-disabled">
					<div className="wpcom-plugins__list">
						{ plugins.map( ( { name, supportLink, icon, plan, description } ) =>
							<BusinessPlugin
								{ ...{ name, key: name, supportLink, icon, plan, description } }
							/>
						) }
					</div>
				</Card>
			</div>
		);
	}
} );

BusinessPluginsPanel.propTypes = {
	plugins: PropTypes.array
};

export default BusinessPluginsPanel;
