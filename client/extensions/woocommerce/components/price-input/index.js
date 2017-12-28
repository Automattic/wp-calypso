/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'client/components/forms/form-currency-input';
import FormTextInput from 'client/components/forms/form-text-input';
import { getCurrencyObject } from 'client/lib/format-currency';
import { getPaymentCurrencySettings } from 'client/extensions/woocommerce/state/sites/settings/general/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import QuerySettingsGeneral from 'client/extensions/woocommerce/components/query-settings-general';

class PriceInput extends Component {
	static propTypes = {
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		currency: PropTypes.string,
		currencySetting: PropTypes.shape( {
			value: PropTypes.string,
		} ),
	};

	render() {
		const { siteId, value, currency, currencySetting } = this.props;
		const props = {
			...omit( this.props, [ 'value', 'currency', 'currencySetting', 'siteId', 'dispatch' ] ),
		};
		const displayCurrency = ! currency && currencySetting ? currencySetting.value : currency;
		const currencyObject = getCurrencyObject( value, displayCurrency );
		return (
			<div>
				<QuerySettingsGeneral siteId={ siteId } />
				{ currencyObject ? (
					<FormCurrencyInput
						currencySymbolPrefix={ currencyObject.symbol }
						value={ value }
						{ ...props }
					/>
				) : (
					<FormTextInput value={ value } { ...omit( props, [ 'noWrap', 'min' ] ) } />
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
