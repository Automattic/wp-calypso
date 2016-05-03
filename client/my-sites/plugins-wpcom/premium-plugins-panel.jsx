import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Card from 'components/card';
import SectionHeader from 'components/section-header';
import PurchaseButton from './purchase-button';
import { recordTracksEvent } from 'state/analytics/actions';

import Plugin from './plugin';

export const PremiumPluginsPanel = React.createClass( {
	render() {
		const {
			isActive = false,
			onClick,
			purchaseLink,
			plugins = []
		} = this.props;

		const cardClasses = classNames( 'wpcom-plugins__premium-panel', {
			'is-disabled': ! isActive
		} );

		return (
			<div>
				<SectionHeader label={ this.translate( 'Premium Plan Upgrades' ) }>
					<PurchaseButton { ...{ isActive, href: purchaseLink } } />
				</SectionHeader>

				<Card className={ cardClasses }>
					<div className="wpcom-plugins__list">
						{ plugins.map( ( { name, descriptionLink, icon, category, description } ) =>
							<Plugin
								onClick={ () => onClick( name ) }
								{ ...{
									name,
									key: name,
									descriptionLink,
									icon,
									isActive,
									category,
									description
								} }
							/>
						) }
					</div>
				</Card>
			</div>
		);
	}
} );

PremiumPluginsPanel.propTypes = {
	isActive: PropTypes.bool,
	purchaseLink: PropTypes.string.isRequired,
	plugins: PropTypes.array
};

const trackClick = name => recordTracksEvent(
	'calypso_plugin_wpcom_click',
	{
		plugin_name: name,
		plugin_plan: 'premium'
	}
);

const mapDispatchToProps = dispatch => ( {
	onClick: name => dispatch( trackClick( name ) )
} );

export default connect( null, mapDispatchToProps )( PremiumPluginsPanel );
