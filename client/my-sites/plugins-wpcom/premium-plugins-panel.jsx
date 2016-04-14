import React, { PropTypes } from 'react';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Button from 'components/button';

import PremiumPlugin from './plugin-types/premium-plugin';

export const PremiumPluginsPanel = React.createClass( {
	render() {
		const { plugins } = this.props;

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
