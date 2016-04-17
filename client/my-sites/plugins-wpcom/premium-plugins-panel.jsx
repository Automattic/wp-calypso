import React, { PropTypes } from 'react';
import classNames from 'classnames';

import Card from 'components/card';
import SectionHeader from 'components/section-header';

import PremiumPlugin from './plugin-types/premium-plugin';

export const PremiumPluginsPanel = React.createClass( {
	render() {
		const {
			isActive = false,
			plugins = []
		} = this.props;

		const cardClasses = classNames( 'wpcom-plugins__premium-panel', {
			'is-disabled': ! isActive
		} );

		return (
			<div>
				<SectionHeader label={ this.translate( 'Premium Plan Upgrades' ) }>
					<PurchaseButton { ...{ isActive } } />
				</SectionHeader>

				<Card className={ cardClasses }>
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
