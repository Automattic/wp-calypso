/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { omit } from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormTextInput from 'components/forms/form-text-input';
import { getCurrencyObject } from 'lib/format-currency';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class PriceInput extends Component {

	static propTypes = {
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		currency: PropTypes.string,
		currencySetting: PropTypes.shape( {
			value: PropTypes.string,
		} ),
	};

	componentDidMount() {
		const { siteId, currency } = this.props;

		if ( siteId && ! currency ) {
			this.props.fetchSettingsGeneral( siteId );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { siteId, currency } = this.props;

		if ( siteId !== newProps.siteId && ! currency ) {
			this.props.fetchSettingsGeneral( newProps.siteId );
		}
	}

	render() {
		const { value, currency, currencySetting } = this.props;
		const props = { ...omit( this.props, [ 'value', 'currency', 'currencySetting', 'siteId', 'fetchSettingsGeneral' ] ) };
		const displayCurrency = ! currency && currencySetting ? currencySetting.value : currency;
		const currencyObject = getCurrencyObject( value, displayCurrency );
		if ( ! currencyObject ) {
			return (
				<FormTextInput
					value={ value }
					{ ...omit( props, [ 'noWrap' ] ) } />
			);
		}

		return (
			<FormCurrencyInput
				currencySymbolPrefix={ currencyObject.symbol }
				value={ value }
				{ ...props } />
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

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( PriceInput );
