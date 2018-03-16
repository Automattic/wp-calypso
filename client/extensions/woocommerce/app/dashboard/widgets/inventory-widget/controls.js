/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	areSettingsProductsLoaded,
	getProductsSettingValue,
} from 'woocommerce/state/sites/settings/products/selectors';
import Button from 'components/button';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Range from 'components/forms/range';

class InventoryControls extends Component {
	static propTypes = {
		isLoaded: PropTypes.bool.isRequired,
		lowStockThreshold: PropTypes.number.isRequired,
		noStockThreshold: PropTypes.number.isRequired,
		notifyLowStockEnabled: PropTypes.bool.isRequired,
		notifyNoStockEnabled: PropTypes.bool.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	constructor( props ) {
		super( props );
		this.state = {
			lowStockThreshold: props.lowStockThreshold,
			noStockThreshold: props.noStockThreshold,
			notifyLowStockEnabled: props.notifyLowStockEnabled,
			notifyNoStockEnabled: props.notifyNoStockEnabled,
		};
	}

	setValue = name => event => {
		this.setState( { [ name ]: event.target.value } );
	};

	setChecked = name => () => {
		this.setState( state => ( { [ name ]: ! state[ name ] } ) );
	};

	render() {
		const { translate } = this.props;
		const {
			lowStockThreshold,
			noStockThreshold,
			notifyLowStockEnabled,
			notifyNoStockEnabled,
		} = this.state;

		return (
			<div className="inventory-widget__controls">
				<div className="inventory-widget__control">
					<FormLabel htmlFor="low_stock_amount">{ translate( 'Low stock threshold' ) }</FormLabel>
					<div className="inventory-widget__range-input">
						<FormTextInput
							id="low_stock_amount"
							aria-describedby="low_stock_amount_help"
							value={ lowStockThreshold }
							onChange={ this.setValue( 'lowStockThreshold' ) }
						/>
						<Range
							minContent={ <Gridicon icon="minus-small" /> }
							maxContent={ <Gridicon icon="plus-small" /> }
							max="100"
							value={ lowStockThreshold }
							onChange={ this.setValue( 'lowStockThreshold' ) }
						/>
					</div>
					<FormSettingExplanation id="low_stock_amount_help">
						{ translate(
							'Products with stock lower than this value will be highlighted in this widget.'
						) }
					</FormSettingExplanation>
				</div>
				<div className="inventory-widget__control">
					<FormLabel htmlFor="no_stock_amount">{ translate( 'Out of stock threshold' ) }</FormLabel>
					<div className="inventory-widget__range-input">
						<FormTextInput
							id="no_stock_amount"
							aria-describedby="no_stock_amount_help"
							value={ noStockThreshold }
							onChange={ this.setValue( 'noStockThreshold' ) }
						/>
						<Range
							minContent={ <Gridicon icon="minus-small" /> }
							maxContent={ <Gridicon icon="plus-small" /> }
							max="100"
							value={ noStockThreshold }
							onChange={ this.setValue( 'noStockThreshold' ) }
						/>
					</div>
					<FormSettingExplanation id="no_stock_amount_help">
						{ translate(
							'Products with stock lower than this value will be considered out of stock.'
						) }
					</FormSettingExplanation>
				</div>

				<FormFieldset className="inventory-widget__control">
					<FormLegend>{ translate( 'Email me' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox
							checked={ notifyLowStockEnabled }
							onChange={ this.setChecked( 'notifyLowStockEnabled' ) }
						/>
						<span>{ translate( 'When products are low on stock' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormCheckbox
							checked={ notifyNoStockEnabled }
							onChange={ this.setChecked( 'notifyNoStockEnabled' ) }
						/>
						<span>{ translate( 'When products are out of stock' ) }</span>
					</FormLabel>
				</FormFieldset>

				<Button primary>{ translate( 'Save' ) }</Button>
			</div>
		);
	}
}

export default connect( state => {
	const site = getSelectedSiteWithFallback( state );
	const isLoaded = areSettingsProductsLoaded( state );
	const lowStockThreshold = parseInt(
		getProductsSettingValue( state, 'woocommerce_notify_low_stock_amount' ) || 0
	);
	const noStockThreshold = parseInt(
		getProductsSettingValue( state, 'woocommerce_notify_no_stock_amount' ) || 0
	);
	const notifyLowStockEnabled =
		'yes' === getProductsSettingValue( state, 'woocommerce_notify_low_stock' );
	const notifyNoStockEnabled =
		'yes' === getProductsSettingValue( state, 'woocommerce_notify_no_stock' );

	return {
		isLoaded,
		lowStockThreshold,
		noStockThreshold,
		notifyLowStockEnabled,
		notifyNoStockEnabled,
		site,
	};
} )( localize( InventoryControls ) );
