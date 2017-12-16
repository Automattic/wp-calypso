/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyObject } from 'lib/format-currency';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class PriceInput extends Component {
	static propTypes = {
		currency: PropTypes.string,
		currencySetting: PropTypes.shape( {
			value: PropTypes.string,
		} ),
		initialValue: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		name: PropTypes.string,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	};

	constructor( props ) {
		super( props );

		this.state = {
			value: props.value,
		};
	}

	componentWillReceiveProps( { value } ) {
		this.setState( { value } );
	}

	resetToInitial = () => {
		const { initialValue, name = '' } = this.props;
		this.setState( { value: initialValue }, () => {
			// All uses of onChange expect and event object of this shape
			this.props.onChange( {
				target: {
					name,
					value: initialValue,
				},
			} );
		} );
	};

	render() {
		const { currency, currencySetting, initialValue, siteId, value } = this.props;
		const props = {
			...omit( this.props, [
				'currency',
				'currencySetting',
				'dispatch',
				'initialValue',
				'siteId',
				'value',
			] ),
		};
		const displayCurrency = ! currency && currencySetting ? currencySetting.value : currency;
		const currencyObject = getCurrencyObject( value, displayCurrency );
		let resetButton;
		if ( initialValue ) {
			resetButton = (
				<Button onClick={ this.resetToInitial } compact borderless>
					<Gridicon icon="undo" />
				</Button>
			);
		}
		return (
			<div>
				<QuerySettingsGeneral siteId={ siteId } />
				{ currencyObject ? (
					<FormCurrencyInput
						currencySymbolPrefix={ currencyObject.symbol }
						currencySymbolSuffix={ resetButton }
						value={ this.state.value }
						{ ...props }
					/>
				) : (
					<FormTextInput value={ this.state.value } { ...omit( props, [ 'noWrap', 'min' ] ) } />
				) }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const currencySetting = getPaymentCurrencySettings( state );
	return {
		siteId,
		currencySetting,
	};
}

export default connect( mapStateToProps )( PriceInput );
