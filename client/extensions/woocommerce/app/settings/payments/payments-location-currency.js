/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { decodeEntities } from 'lib/formatting';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import StoreAddress from 'woocommerce/components/store-address';
import { changeCurrency } from 'woocommerce/state/ui/payments/currency/actions';
import { fetchCurrencies } from 'woocommerce/state/sites/data/currencies/actions';
import { getCurrencies } from 'woocommerce/state/sites/data/currencies/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class SettingsPaymentsLocationCurrency extends Component {
	static propTypes = {
		changeCurrency: PropTypes.func.isRequired,
		currencies: PropTypes.array,
		currency: PropTypes.string,
		fetchCurrencies: PropTypes.func.isRequired,
		getCurrencyWithEdits: PropTypes.func.isRequired,
		onChange: PropTypes.func.isRequired,
		site: PropTypes.object,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchCurrencies( site.ID );
		}
	};

	UNSAFE_componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchCurrencies( newSiteId );
		}
	};

	renderOption = ( currency ) => {
		const { currencies } = this.props;
		const option = find( currencies, { code: currency } );
		return (
			<option key={ option.code } value={ option.code }>
				{ decodeEntities( option.symbol ) } - { decodeEntities( option.name ) }
			</option>
		);
	};

	onChange = ( e ) => {
		const { site } = this.props;
		const newCurrency = e.target.value;
		this.props.changeCurrency( site.ID, newCurrency );
		this.props.onChange();
	};

	render() {
		const { currencies, currency, site, translate } = this.props;
		const validCurrencies = [ 'USD', 'AUD', 'CAD', 'GBP', 'BRL' ];
		return (
			<div className="payments__location-currency">
				<QuerySettingsGeneral siteId={ site && site.ID } />
				<ExtendedHeader
					label={ translate( 'Store location and currency' ) }
					description={ translate(
						'Different options are available based on your location and currency.'
					) }
				/>
				<Card className="payments__address-currency-container">
					<StoreAddress showLabel={ false } />
					<div className="payments__currency-container">
						<FormLabel>{ translate( 'Store currency' ) }</FormLabel>
						<FormSelect
							className="payments__currency-select"
							onChange={ this.onChange }
							value={ currency }
							disabled={ ! currency }
						>
							{ currency &&
								currencies &&
								currencies.length &&
								validCurrencies.map( this.renderOption ) }
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
			getCurrencyWithEdits,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsLocationCurrency )
);
