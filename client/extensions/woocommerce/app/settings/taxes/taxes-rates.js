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
	getStoreLocation
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areTaxRatesLoaded,
	getTaxRates,
} from 'woocommerce/state/sites/meta/taxrates/selectors';
import Card from 'components/card';
import Countries from 'woocommerce/lib/countries';
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
		let summary = translate(
			'Sorry, we are unable to determine the tax rates in ' +
			'effect at your location at this time. ' +
			'(Country: %(country)s, State/Province: %(state)s)',
			{ args: { state: address.state, country: address.country } }
		);

		if ( address.country && address.state ) {
			const countryData = find( Countries, { code: address.country } );
			if ( countryData ) {
				const stateData = find( countryData, { code: address.state } );
				if ( stateData ) {
					if ( 'CA' === address.country ) {
						summary = translate(
							'Since your store is located in %(province)s, you\'re ' +
							'required to collect tax for orders delivered within Canada. ' +
							'The tax due is based on the customer\'s address. ' +
							'We\'ll automatically calculate the appropriate tax during ' +
							'checkout for your customers.',
							{ args: { province: stateData.name } }
						);
					} else {
						const salesTaxBasis = stateData.salesTaxBasis;
						switch ( salesTaxBasis ) {
							case 'none':
								summary = translate(
									'Since your store is located in %(state)s you\'re ' +
									'not required to collect sales tax.',
									{ args: { state: stateData.name } }
								);
								break;
							case 'origin':
								summary = translate(
									'Since your store is located in %(state)s you\'re ' +
									'required to collect sales tax for orders delivered .' +
									'within your state. In %(state)s, the sales tax due ' +
									'is based on your store address.',
									{ args: { state: stateData.name } }
								);
								break;
							case 'destination':
								summary = translate(
									'Since your store is located in %(state)s you\'re ' +
									'required to collect sales tax for orders delivered .' +
									'within your state. In %(state)s, the sales tax due ' +
									'is based on your customer\'s address.',
									{ args: { state: stateData.name } }
								);
								break;
						}
					}
				}
			}
		}

		return (
			<div className="taxes__summary">
				{ summary }
			</div>
		);
	}

	renderRates = () => {
		// TODO
		return null;
	}

	render = () => {
		const { loadedSettingsGeneral, loadedTaxRates, translate } = this.props;

		if ( ! loadedSettingsGeneral ) {
			return null;
		}

		if ( ! loadedTaxRates ) {
			return null;
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
