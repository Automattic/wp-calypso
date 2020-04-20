/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { isNaN } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	areSettingsProductsLoaded,
	getProductsSettingValue,
} from 'woocommerce/state/sites/settings/products/selectors';
import { Button } from '@automattic/components';
import { errorNotice, successNotice } from 'state/notices/actions';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Range from 'components/forms/range';
import { updateSettingsProducts } from 'woocommerce/state/sites/settings/products/actions';

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

	setValue = ( name ) => ( event ) => {
		const value = parseInt( event.target.value );
		this.setState( { [ name ]: isNaN( value ) ? 0 : value } );
	};

	increaseValue = ( name ) => () => {
		const value = this.state[ name ];
		if ( value >= 99 ) {
			return;
		}
		this.setState( { [ name ]: value + 1 } );
	};

	decreaseValue = ( name ) => () => {
		const value = this.state[ name ];
		if ( value < 1 ) {
			return;
		}
		this.setState( { [ name ]: value - 1 } );
	};

	setChecked = ( name ) => () => {
		this.setState( ( state ) => ( { [ name ]: ! state[ name ] } ) );
	};

	close = () => {
		this.props.close();
	};

	saveSettings = ( event ) => {
		event.preventDefault();
		const { site, translate } = this.props;
		this.props.save(
			site.ID,
			[
				{
					id: 'woocommerce_notify_low_stock_amount',
					value: this.state.lowStockThreshold,
				},
				{
					id: 'woocommerce_notify_no_stock_amount',
					value: this.state.noStockThreshold,
				},
				{
					id: 'woocommerce_notify_low_stock',
					value: this.state.notifyLowStockEnabled ? 'yes' : 'no',
				},
				{
					id: 'woocommerce_notify_no_stock',
					value: this.state.notifyNoStockEnabled ? 'yes' : 'no',
				},
			],
			successNotice( translate( 'Stock notification settings saved.' ), { duration: 8000 } ),
			errorNotice( translate( 'Unable to save settings.' ), { duration: 8000 } )
		);

		// Give a little time between "Save" & closing
		setTimeout( () => {
			this.close();
		}, 150 );
	};

	renderPlus = ( name ) => {
		return (
			<span onClick={ this.increaseValue( name ) } tabIndex="-1" aria-hidden>
				<Gridicon icon="plus-small" />
			</span>
		);
	};

	renderMinus = ( name ) => {
		return (
			<span onClick={ this.decreaseValue( name ) } tabIndex="-1" aria-hidden>
				<Gridicon icon="minus-small" />
			</span>
		);
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
							minContent={ this.renderMinus( 'lowStockThreshold' ) }
							maxContent={ this.renderPlus( 'lowStockThreshold' ) }
							aria-describedby="low_stock_amount_help"
							max="99"
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
							minContent={ this.renderMinus( 'noStockThreshold' ) }
							maxContent={ this.renderPlus( 'noStockThreshold' ) }
							aria-describedby="no_stock_amount_help"
							max="99"
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

				<Button onClick={ this.close }>{ translate( 'Cancel' ) }</Button>
				<Button onClick={ this.saveSettings } primary>
					{ translate( 'Save' ) }
				</Button>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSiteWithFallback( state );
		const isLoaded = areSettingsProductsLoaded( state );
		const lowStockThreshold = parseInt(
			getProductsSettingValue( state, 'woocommerce_notify_low_stock_amount' )
		);
		const noStockThreshold = parseInt(
			getProductsSettingValue( state, 'woocommerce_notify_no_stock_amount' )
		);
		const notifyLowStockEnabled =
			'yes' === getProductsSettingValue( state, 'woocommerce_notify_low_stock' );
		const notifyNoStockEnabled =
			'yes' === getProductsSettingValue( state, 'woocommerce_notify_no_stock' );

		return {
			isLoaded,
			lowStockThreshold: isNaN( lowStockThreshold ) ? 0 : lowStockThreshold,
			noStockThreshold: isNaN( noStockThreshold ) ? 0 : noStockThreshold,
			notifyLowStockEnabled,
			notifyNoStockEnabled,
			site,
		};
	},
	{
		save: updateSettingsProducts,
	}
)( localize( InventoryControls ) );
