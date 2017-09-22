/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose, identity } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Plugin from './plugin';
import PurchaseButton from './purchase-button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { recordTracksEvent } from 'state/analytics/actions';

export const PremiumPluginsPanel = ( {
	isActive = false,
	onClick,
	purchaseLink,
	plugins = [],
	translate = identity,
} ) => (
	<div>
		<SectionHeader label={ translate( 'Premium Plan Upgrades' ) }>
			<PurchaseButton { ...{ isActive, href: purchaseLink } } />
		</SectionHeader>

		<Card className={ classNames( 'wpcom-plugins__premium-panel', {
			'is-disabled': ! isActive,
		} ) }>
			<div className="wpcom-plugins__list">
				{ plugins.map( ( { name, descriptionLink, icon, category, description } ) =>
					<Plugin
						{ ...{
							category,
							description,
							descriptionLink,
							icon,
							isActive,
							key: name,
							name,
							onClick,
						} }
					/>
				) }
			</div>
		</Card>
	</div>
);

PremiumPluginsPanel.propTypes = {
	isActive: PropTypes.bool,
	purchaseLink: PropTypes.string.isRequired,
	plugins: PropTypes.array
};

const trackClick = name =>
	recordTracksEvent( 'calypso_plugin_wpcom_click', {
		plugin_name: name,
		plugin_plan: 'premium',
	} );

const mapDispatchToProps = dispatch => ( {
	onClick: compose( dispatch, trackClick ),
} );

export default connect( null, mapDispatchToProps )( localize( PremiumPluginsPanel ) );
