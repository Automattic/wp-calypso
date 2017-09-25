/**
 * External dependencies
 */
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyObject } from 'lib/format-currency';
import { getSelectedSiteId } from 'state/ui/selectors';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';

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
		const props = { ...omit( this.props, [ 'value', 'currency', 'currencySetting', 'siteId', 'dispatch' ] ) };
		const displayCurrency = ! currency && currencySetting ? currencySetting.value : currency;
		const currencyObject = getCurrencyObject( value, displayCurrency );
		return (
			<div>
				<QuerySettingsGeneral siteId={ siteId } />
				{ currencyObject
					? <FormCurrencyInput
							currencySymbolPrefix={ currencyObject.symbol }
							value={ value }
							{ ...props } />
					: <FormTextInput
							value={ value }
							{ ...omit( props, [ 'noWrap', 'min' ] ) } />
				}
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
