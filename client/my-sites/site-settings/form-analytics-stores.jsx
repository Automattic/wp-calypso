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

	render = () => {
		const { disabled, translate } = this.props;

		return (
			<div>
				<FormLegend>{ translate( 'Basic store analytics' ) }</FormLegend>
				{ this.renderBasicSettings( disabled ) }
			</div>
		);
	};
}

export default localize( FormAnalyticsStores );
