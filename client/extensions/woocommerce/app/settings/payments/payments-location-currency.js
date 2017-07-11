/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { decodeEntities } from 'lib/formatting';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import StoreAddress from 'woocommerce/components/store-address';
import { changeCurrency } from 'woocommerce/state/ui/payments/currency/actions';
import { fetchCurrencies } from 'woocommerce/state/sites/currencies/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getCurrencies } from 'woocommerce/state/sites/currencies/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class SettingsPaymentsLocationCurrency extends Component {
	static propTypes = {
		changeCurrency: PropTypes.func.isRequired,
		currencies: PropTypes.array,
		currency: PropTypes.string,
		fetchCurrencies: PropTypes.func.isRequired,
		fetchSettingsGeneral: PropTypes.func.isRequired,
		getCurrencyWithEdits: PropTypes.func.isRequired,
		site: PropTypes.object,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchCurrencies( site.ID );
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchCurrencies( newSiteId );
			this.props.fetchSettingsGeneral( newSiteId );
		}
	}

	renderOption = ( currency ) => {
		const { currencies } = this.props;
		const option = find( currencies, { code: currency } );
		return (
			<option
				key={ option.code }
				value={ option.code } >
				{ decodeEntities( option.symbol ) } - { decodeEntities( option.name ) }
			</option>
		);
	}

	onChange = ( e ) => {
		const { site } = this.props;
		const newCurrency = e.target.value;
		this.props.changeCurrency(
			site.ID,
			newCurrency
		);
	}

	render() {
		const { currencies, currency, translate } = this.props;
		const validCurrencies = [ 'USD', 'AUD', 'CAD', 'GBP', 'BRL' ];
		return (
			<div className="payments__location-currency">
				<ExtendedHeader
					label={ translate( 'Store location and currency' ) }
					description={
						translate(
							'Different options are available based on your location and currency.'
						)
					} />
				<Card className="payments__address-currency-container">
					<StoreAddress />
					<div className="payments__currency-container">
						<FormLabel>
							{ translate( 'Store Currency' ) }
						</FormLabel>
						<FormSelect
							className="payments__currency-select"
							onChange={ this.onChange }
							value={ currency }>
							{ currencies && currencies.length && validCurrencies.map( this.renderOption ) }
						</FormSelect>
					</div>

				</Card>
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const currencies = getCurrencies( state );
	const currency = getCurrencyWithEdits( state );
	return {
		currencies,
		currency,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			changeCurrency,
			fetchCurrencies,
			fetchSettingsGeneral,
			getCurrencyWithEdits,
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsLocationCurrency ) );
