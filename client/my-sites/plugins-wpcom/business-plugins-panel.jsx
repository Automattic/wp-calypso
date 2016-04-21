import React, { PropTypes } from 'react';
import classNames from 'classnames';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import BusinessPlugin from './plugin-types/business-plugin';
import PurchaseButton from './purchase-button';

export const BusinessPluginsPanel = React.createClass( {
	render() {
		const {
			isActive = false,
			purchaseLink,
			plugins = []
		} = this.props;

		const cardClasses = classNames( 'wpcom-plugins__business-panel', {
			'is-disabled': ! isActive
		} );

		return (
			<div>
				<SectionHeader label={ this.translate( 'Business Plan Upgrades' ) }>
					<PurchaseButton { ...{ isActive, href: purchaseLink } } />
				</SectionHeader>

				<Card className={ cardClasses }>
					<div className="wpcom-plugins__list">
						{ plugins.map( ( { name, descriptionLink, icon, plan, description } ) =>
							<BusinessPlugin
								{ ...{ name, key: name, descriptionLink, icon, plan, description } }
							/>
						) }
					</div>
				</Card>
			</div>
		);
	}
} );

BusinessPluginsPanel.propTypes = {
	isActive: PropTypes.bool,
	purchaseLink: PropTypes.string.isRequired,
	plugins: PropTypes.array
};

export default BusinessPluginsPanel;
