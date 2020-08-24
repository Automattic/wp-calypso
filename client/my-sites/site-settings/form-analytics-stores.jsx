/**
 * External dependencies
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ExternalLink from 'components/external-link';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

class FormAnalyticsStores extends Component {
	handleToggleChange = ( name ) => () => {
		this.props.handleToggleChange( name );
	};

	renderExplanation = ( setting ) => {
		const link = setting.link ? (
			<ExternalLink icon href={ setting.link.url } target="_blank" rel="noopener noreferrer">
				{ setting.link.label }
			</ExternalLink>
		) : null;

		return (
			<FormSettingExplanation>
				{ setting.explanation }
				{ link }
			</FormSettingExplanation>
		);
	};

	renderSettings = ( settings, disableAll, isChild = false ) => {
		const { fields } = this.props;

		const classes = classNames( {
			'site-settings__analytics-stores-settings': ! isChild,
			'site-settings__analytics-stores-child-settings': isChild,
		} );

		return (
			<div className={ classes }>
				{ settings.map( ( setting ) => {
					const checked = fields.wga ? Boolean( fields.wga[ setting.key ] ) : false;
					return (
						<div key={ setting.key }>
							<CompactFormToggle
								checked={ checked }
								disabled={ disableAll }
								onChange={ this.handleToggleChange( setting.key ) }
							>
								{ setting.label }
							</CompactFormToggle>
							{ setting.explanation && this.renderExplanation( setting ) }
							{ setting.children &&
								this.renderSettings( setting.children, disableAll || ! checked, true ) }
						</div>
					);
				} ) }
			</div>
		);
	};

	renderBasicSettings = ( disableAll ) => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'ec_track_purchases',
				label: translate( 'Purchase transactions' ),
			},
			{
				key: 'ec_track_add_to_cart',
				label: translate( 'Add to cart events' ),
				explanation: translate(
					'Before enabling these, turn on eCommerce in your Google Analytics dashboard.'
				),
				link: {
					label: translate( 'Learn how' ),
					url: 'https://support.google.com/analytics/answer/1009612#Enable',
				},
			},
		];

		return this.renderSettings( settings, disableAll );
	};

	renderEnhancedSettings = ( disableAll ) => {
		const { translate } = this.props;
		const settings = [
			{
				key: 'enh_ec_tracking',
				label: translate( 'Enable Enhanced eCommerce' ),
				explanation: translate(
					'Before enabling, turn on enhanced eCommerce in your Google Analytics dashboard.'
				),
				link: {
					label: translate( 'Learn how' ),
					url: 'https://support.google.com/analytics/answer/6032539',
				},
				children: [
					{
						key: 'enh_ec_track_remove_from_cart',
						label: translate( 'Remove from Cart events' ),
					},
					{
						key: 'enh_ec_track_prod_impression',
						label: translate( 'Product impressions from listing pages' ),
					},
					{
						key: 'enh_ec_track_prod_click',
						label: translate( 'Product clicks from listing pages' ),
					},
					{
						key: 'enh_ec_track_prod_detail_view',
						label: translate( 'Product detail views' ),
					},
					{
						key: 'enh_ec_track_checkout_started',
						label: translate( 'Checkout process initiated' ),
					},
				],
			},
		];

		return this.renderSettings( settings, disableAll );
	};

	render = () => {
		const { disabled, translate } = this.props;

		return (
			<div>
				<FormLegend>{ translate( 'Basic store analytics' ) }</FormLegend>
				{ this.renderBasicSettings( disabled ) }
				<FormLegend>{ translate( 'Enhanced store analytics' ) }</FormLegend>
				{ this.renderEnhancedSettings( disabled ) }
			</div>
		);
	};
}

export default localize( FormAnalyticsStores );
