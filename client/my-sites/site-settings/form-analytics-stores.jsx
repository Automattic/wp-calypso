/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

class FormAnalyticsStores extends Component {
	handleToggleChange = ( name ) => () => {
		this.props.handleToggleChange( name );
	}

	renderSettings = ( settings, disableAll ) => {
		const { fields } = this.props;

		return (
			<div>
				{
					settings.map( setting =>
						<CompactFormToggle
							checked={ fields.wga ? fields.wga[ setting.key ] : false }
							disabled={ disableAll }
							onChange={ this.handleToggleChange( setting.key ) }>
							{ setting.label }
						</CompactFormToggle>
					)
				}
			</div>
		);
	}

	renderBasicSettings = ( disableAll ) => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'track_purchases',
				label: translate( 'Purchase transactions' )
			},
			{
				key: 'track_add_to_cart',
				label: translate( 'Add to cart events' )
			}
		];

		return this.renderSettings( settings, disableAll );
	}

	renderEnhancedSettings = ( disableAll ) => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'track_remove_from_cart',
				label: translate( 'Remove from Cart events' )
			},
			{
				key: 'track_product_impressions',
				label: translate( 'Product impressions from listing pages' )
			},
			{
				key: 'track_product_clicks',
				label: translate( 'Product clicks from listing pages' )
			},
			{
				key: 'track_product_detail_views',
				label: translate( 'Product detail views' )
			},
			{
				key: 'track_checkout_initiated',
				label: translate( 'Checkout process initiated' )
			},
		];

		return this.renderSettings( settings, disableAll );
	}

	render = () => {
		const { disabled, fields, translate } = this.props;
		const enhancedEnabled = fields.wga ? fields.wga.enhanced_ecommerce : false;

		return (
			<div>
				<FormLegend>
					{ translate( 'Basic store analytics' ) }
				</FormLegend>
				{ this.renderBasicSettings( disabled ) }
				<FormLegend>
					{ translate( 'Advanced store analytics' ) }
				</FormLegend>
				<FormFieldset>
					<CompactFormToggle
						checked={ enhancedEnabled }
						disabled={ disabled }
						onChange={ this.handleToggleChange( 'enhanced_ecommerce' ) }>
						{ translate( 'Enable Enhanced eCommerce' ) }
					</CompactFormToggle>
					<FormSettingExplanation>
						{
							translate(
								'Before enabling, turn on enhanced eCommerce in your Google Analytics dashboard.'
							)
						}
					</FormSettingExplanation>
				</FormFieldset>
				{ this.renderEnhancedSettings( disabled || ! enhancedEnabled ) }
			</div>
		);
	}
}

export default localize( FormAnalyticsStores );
