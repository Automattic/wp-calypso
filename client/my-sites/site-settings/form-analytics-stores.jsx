/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormLegend from 'components/forms/form-legend';

class FormAnalyticsStores extends Component {
	handleToggleChange = name => () => {
		this.props.handleToggleChange( name );
	};

	renderSettings = ( settings, disableAll ) => {
		const { fields } = this.props;

		// TODO - disable changes to a (child) setting if a required (parent) setting is not enabled

		return (
			<div className="site-settings__analytics-stores-basic-settings">
				{ settings.map( setting => (
					<CompactFormToggle
						checked={ fields.wga ? Boolean( fields.wga[ setting.key ] ) : false }
						disabled={ disableAll }
						key={ setting.key }
						onChange={ this.handleToggleChange( setting.key ) }
					>
						{ setting.label }
					</CompactFormToggle>
				) ) }
			</div>
		);
	};

	renderBasicSettings = disableAll => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'ec_track_purchases',
				label: translate( 'Purchase transactions' ),
			},
			{
				key: 'ec_track_add_to_cart',
				label: translate( 'Add to cart events' ),
			},
		];

		return this.renderSettings( settings, disableAll );
	};

	renderAdvancedSettings = disableAll => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'enh_ec_tracking',
				label: translate( 'Enable Enhanced eCommerce' ),
				explanation: translate(
					'Before enabling, turn on enhanced eCommerce in your Google Analytics dashboard.'
				),
			},
			{
				key: 'enh_ec_track_remove_from_cart',
				label: translate( 'Remove from Cart events' ),
				requires: 'enh_ec_tracking',
			},
			{
				key: 'enh_ec_track_prod_impression',
				label: translate( 'Product impressions from listing pages' ),
				requires: 'enh_ec_tracking',
			},
			{
				key: 'enh_ec_track_prod_click',
				label: translate( 'Product clicks from listing pages' ),
				requires: 'enh_ec_tracking',
			},
			{
				key: 'enh_ec_track_prod_detail_view',
				label: translate( 'Product detail views' ),
				requires: 'enh_ec_tracking',
			},
			{
				key: 'enh_ec_track_checkout_started',
				label: translate( 'Checkout process initiated' ),
				requires: 'enh_ec_tracking',
			},
		];

		return this.renderSettings( settings, disableAll );
	};

	render = () => {
		const { disabled, translate } = this.props;

		// TODO config flag it

		return (
			<div>
				<FormLegend>{ translate( 'Basic store analytics' ) }</FormLegend>
				{ this.renderBasicSettings( disabled ) }
				<FormLegend>{ translate( 'Advanced store analytics' ) }</FormLegend>
				{ this.renderAdvancedSettings( disabled ) }
			</div>
		);
	};
}

export default localize( FormAnalyticsStores );
