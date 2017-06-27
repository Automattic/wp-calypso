/**
 * External dependencies
 */

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:allendav' );

import { bindActionCreators } from 'redux';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoaded,
	areTaxCalculationsEnabled,
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
import { getCountryData, getStateData } from 'woocommerce/lib/countries';
import ExtendedHeader from 'woocommerce/components/extended-header';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';
import Notice from 'components/notice';

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

	renderInfo = () => {
		const { address, translate } = this.props;
		const countryData = getCountryData( address.country );
		if ( ! countryData ) {
			return (
				<p>
					{ ( translate(
						'Error: Your country ( %(country)s ) is not recognized',
						{ args: { country: address.country } }
					) ) }
				</p>
			);
		}

		const countryName = countryData.name;
		const stateData = getStateData( address.country, address.state );
		if ( ! stateData ) {
			return (
				<p>
					{ ( translate(
						'Error: Your country ( %(countryName)s ) was recognized, but ' +
						'your state ( %(state)s ) was not. ',
						{ args: { countryName, state: address.state } }
					) ) }
				</p>
			);
		}

		const stateName = stateData.name;

		if ( NO_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ translate( 'Since your store is located in {{strong}}%(stateName)s, ' +
						'%(countryName)s{{/strong}} you\'re not required to collect sales tax.',
						{
							args: { stateName, countryName },
							components: { strong: <strong /> }
						}
					) }
				</p>
			);
		}

		if ( ORIGIN_BASED_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ translate(
						'Since your store is located in {{strong}}%(stateName)s, %(countryName)s{{/strong}} you\'re ' +
						'required to charge sales tax based on your business address.',
						{
							args: { stateName, countryName },
							components: { strong: <strong /> }
						}
					) }
				</p>
			);
		}

		// Default - DESTINATION_BASED_SALES_TAX
		return (
			<p>
				{ translate(
					'Since your store is located in {{strong}}%(stateName)s, %(countryName)s{{/strong}} you\'re ' +
					'required to charge sales tax based on the customer\'s shipping address.',
					{
						args: { stateName, countryName },
						components: { strong: <strong /> }
					}
				) }
			</p>
		);
	}

	renderCalculationStatus = () => {
		const { address, areTaxesEnabled, translate } = this.props;
		const stateData = getStateData( address.country, address.state );

		if ( ! stateData ) {
			return null;
		}

		if ( NO_SALES_TAX === stateData.salesTaxBasis ) {
			return null;
		}

		if ( ! areTaxesEnabled ) {
			return (
				<Notice status="is-error">
					{ translate( 'Sales taxes are not currently being charged. Unless ' +
						'your products are exempt from sales tax we recommend that you ' +
						'{{strong}}enable automatic tax calculation and charging{{/strong}}',
						{
							components: { strong: <strong /> }
						}
						) }
				</Notice>
			);
		}

		if ( DESTINATION_BASED_SALES_TAX === stateData.salesTaxBasis ) {
			return (
				<p>
					{ translate( 'We\'ll automatically calculate and charge the ' +
						'correct rate of tax for you each time a customer checks out.' ) }
				</p>
			);
		}

		return (
			<p>
				{ translate( 'We\'ll automatically calculate and charge sales tax ' +
					'at the following rate each time a customer checks out.' ) }
			</p>
		);
	}

	possiblyRenderRates = () => {
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
					{ this.renderInfo() }
					{ this.renderCalculationStatus() }
					{ this.possiblyRenderRates() }
				</Card>
			</div>
		);
	}
}

function mapStateToProps( state, ownProps ) {
	let siteId = undefined;
	if ( ownProps.site ) {
		siteId = ownProps.site.ID;
	}
	const address = getStoreLocation( state, siteId );
	const loadedSettingsGeneral = areSettingsGeneralLoaded( state, siteId );
	const areTaxesEnabled = areTaxCalculationsEnabled( state, siteId );
	const loadedTaxRates = areTaxRatesLoaded( state, siteId );
	const taxRates = getTaxRates( state, siteId );

	debug( 'areTaxesEnabled=', areTaxesEnabled );

	return {
		address,
		areTaxesEnabled,
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
