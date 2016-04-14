import React, { PropTypes } from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

import BusinessPlugin from './plugin-types/business-plugin';

export const BusinessPluginsPanel = React.createClass( {
	render() {
		const { plugins } = this.props;

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
