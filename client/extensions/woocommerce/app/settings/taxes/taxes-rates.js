/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areTaxRatesLoaded,
	getTaxRates,
} from 'woocommerce/state/sites/meta/taxrates/selectors';
import Card from 'components/card';
import {
	DESTINATION_BASED_SALES_TAX,
	NO_SALES_TAX,
	ORIGIN_BASED_SALES_TAX,
} from 'woocommerce/lib/countries/constants';
import { getStateData } from 'woocommerce/lib/countries';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';

class TaxesRates extends Component {

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
	};

	componentDidMount = () => {
		const { address, loadedSettingsGeneral, loadedTaxJarRates, site } = this.props;

		if ( site && site.ID ) {
			if ( ! loadedSettingsGeneral ) {
				this.props.fetchSettingsGeneral( site.ID );
			} else if ( ! loadedTaxJarRates ) {
				this.props.fetchTaxRates( site.ID, address );
			}
		}
	}

	renderSummary = () => {
		const { address, translate } = this.props;

		const stateData = getStateData( address.country, address.state );
		if ( ! stateData ) {
			return (
				<p>
					{ ( translate(
						'Your location is not yet supported - %(country)s %(state)s',
						{ args: { state: address.state, country: address.country } }
					) ) }
				</p>
			);
		}

		if ( 'CA' === address.country ) {
			return (
				<p>
					{ ( translate( 'Since your store is located in %(province)s, you\'re ' +
						'required to collect tax for orders delivered within Canada. ' +
						'The tax due is based on the customer\'s address. ' +
						'We\'ll automatically calculate the appropriate tax during ' +
						'checkout for your customers.',
						{ args: { province: stateData.name } }
					) ) }
				</p>
			);
		}

		if ( NO_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ ( translate( 'Since your store is located in %(state)s you\'re ' +
						'not required to collect sales tax.',
						{ args: { state: stateData.name } }
					) ) }
				</p>
			);
		}

		if ( ORIGIN_BASED_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ ( translate(
						'Since your store is located in %(state)s you\'re ' +
						'required to collect sales tax for orders delivered ' +
						'within your state. In %(state)s, the sales tax due ' +
						'is based on your store address.',
						{ args: { state: stateData.name } }
					) ) }
				</p>
			);
		}

		if ( DESTINATION_BASED_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ ( translate(
						'Since your store is located in %(state)s you\'re ' +
						'required to collect sales tax for orders delivered ' +
						'within your state. In %(state)s, the sales tax due ' +
						'is based on your customer\'s address.',
						{ args: { state: stateData.name } }
					) ) }
				</p>
			);
		}

		return (
			<p>
				{ ( translate(
					'Sorry, we are unable to determine the tax rates in ' +
					'effect at your location at this time. ' +
					'(Country: %(country)s, State/Province: %(state)s)',
					{ args: { state: address.state, country: address.country } }
				) ) }
			</p>
		);
	}

	renderRates = () => {
		// TODO
		return null;
	}

	render = () => {
		const { loadedSettingsGeneral, loadedTaxRates, translate } = this.props;

		if ( ! loadedSettingsGeneral ) {
			return ( <p> "Waiting for settings general to load" </p> );
		}

		if ( ! loadedTaxRates ) {
			return ( <p> "Waiting for tax rates to load" </p> );
		}

		return (
			<div className="taxes__taxes-rates">
				<ExtendedHeader
					label={ translate( 'Tax rates' ) }
				/>
				<Card>
					{ this.renderSummary() }
					{ this.renderRates() }
				</Card>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const address = getStoreLocation( state );
	const loadedSettingsGeneral = areSettingsGeneralLoaded( state );
	const loadedTaxRates = areTaxRatesLoaded( state );
	const taxRates = getTaxRates( state );
	return {
		address,
		loadedSettingsGeneral,
		loadedTaxRates,
		taxRates,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
			fetchTaxRates,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( TaxesRates ) );
