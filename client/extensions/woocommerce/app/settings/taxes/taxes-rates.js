/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isEmpty, round } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ExternalLink from 'components/external-link';
import FormToggle from 'components/forms/form-toggle';
import Notice from 'components/notice';
import ExtendedHeader from 'woocommerce/components/extended-header';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import Table from 'woocommerce/components/table';
import TableItem from 'woocommerce/components/table/table-item';
import TableRow from 'woocommerce/components/table/table-row';
import { getCountryData, getStateData } from 'woocommerce/lib/countries';
import { DESTINATION_BASED_SALES_TAX, NO_SALES_TAX, ORIGIN_BASED_SALES_TAX } from 'woocommerce/lib/countries/constants';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';
import { areTaxRatesLoaded, getTaxRates } from 'woocommerce/state/sites/meta/taxrates/selectors';
import { areSettingsGeneralLoaded, areTaxCalculationsEnabled, getStoreLocation } from 'woocommerce/state/sites/settings/general/selectors';

class TaxesRates extends Component {

	static propTypes = {
		onEnabledChange: PropTypes.func.isRequired,
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
	};

	componentDidMount = () => {
		const { address, loadedSettingsGeneral, loadedTaxRates, site } = this.props;

		if ( site && site.ID ) {
			if ( loadedSettingsGeneral && ! loadedTaxRates ) {
				this.props.fetchTaxRates( site.ID, address );
			}
		}
	}

	componentWillReceiveProps = ( nextProps ) => {
		if ( nextProps.loadedSettingsGeneral ) {
			if ( ! nextProps.loadedTaxRates ) {
				this.props.fetchTaxRates( nextProps.site.ID, nextProps.address );
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
				<Notice showDismiss={ false } status="is-error">
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
				<div className="taxes__taxes-calculate">
					<Gridicon icon="checkmark" />
					{ translate( 'We\'ll automatically calculate and charge the ' +
						'correct rate of tax for you each time a customer checks out.' ) }
				</div>
			);
		}

		return (
			<div className="taxes__taxes-calculate">
				<Gridicon icon="checkmark" />
				{ translate( 'We\'ll automatically calculate and charge sales tax ' +
					'at the following rate each time a customer checks out.' ) }
			</div>
		);
	}

	possiblyRenderRates = () => {
		const { address, areTaxesEnabled, taxRates, translate } = this.props;
		if ( ! areTaxesEnabled ) {
			return null;
		}

		const stateData = getStateData( address.country, address.state );
		if ( ! stateData ) {
			return null;
		}

		if ( ORIGIN_BASED_SALES_TAX !== stateData.salesTaxBasis ) {
			return null;
		}

		if ( isEmpty( taxRates ) ) {
			return (
				<Notice showDismiss={ false } status="is-error">
					{ translate( 'The WordPress.com sales tax rate service is not ' +
						'available for this site.' ) }
				</Notice>
			);
		}

		let state_rate = ( 'state_rate' in taxRates ) ? parseFloat( taxRates.state_rate ) : 0;
		let combined_rate = ( 'combined_rate' in taxRates ) ? parseFloat( taxRates.combined_rate ) : 0;
		let local_rate = combined_rate - state_rate;

		state_rate = round( state_rate * 100, 2 );
		combined_rate = round( combined_rate * 100, 2 );
		local_rate = round( local_rate * 100, 2 );

		const rates = [];

		if ( 0 < state_rate ) {
			rates.push( {
				name: translate( 'State Tax' ),
				rate: state_rate
			} );
			if ( 0 < local_rate ) {
				rates.push( {
					name: translate( 'Local Tax' ),
					rate: local_rate
				} );
			}
		}

		rates.push( {
			name: translate( 'Total Tax' ),
			rate: combined_rate
		} );

		return (
			<Table className="taxes__taxes-rates-table">
				<TableRow isHeader>
					<TableItem isHeader>
						{ translate( 'Name' ) }
					</TableItem>
					<TableItem isHeader>
						{ translate( 'Rate' ) }
					</TableItem>
				</TableRow>
				{ rates.map( ( row, i ) => (
					<TableRow key={ i }>
							<TableItem key={ i }>{ row.name }</TableItem>
							<TableItem key={ i + 1 }>{ row.rate }%</TableItem>
					</TableRow>
				) ) }
			</Table>
		);
	}

	renderPolicyNotice = () => {
		const { translate } = this.props;

		return (
			<div className="taxes__taxes-taxjar-notice">
				{ translate( 'Sales tax calculations are provided by a third party: TaxJar. By enabling this option, ' +
					'TaxJar will have access to some of your data.' )
				}
				<ExternalLink
					icon
					href="https://en.support.wordpress.com/taxjar/"
					target="_blank"
					rel="noopener noreferrer"
				>
					{ translate( 'Learn more' ) }
				</ExternalLink>
			</div>
		);
	}

	render = () => {
		const { site, loadedSettingsGeneral, loadedTaxRates, onEnabledChange, taxesEnabled, translate } = this.props;

		if ( ! loadedSettingsGeneral ) {
			return <QuerySettingsGeneral siteId={ site && site.ID } />;
		}

		if ( ! loadedTaxRates ) {
			return null;
		}

		const toggleMessage = translate( 'Tax calculations enabled' );

		return (
			<div className="taxes__taxes-rates">
				<ExtendedHeader
					label={ translate( 'Tax rates' ) } >
					<FormToggle
						name="taxesEnabled"
						onChange={ onEnabledChange }
						checked={ taxesEnabled } >
						<span className="taxes__taxes-calculate-label">
							{ toggleMessage }
						</span>
					</FormToggle>
				</ExtendedHeader>
				<Card>
					{ this.renderInfo() }
					{ this.renderCalculationStatus() }
					{ this.possiblyRenderRates() }
					{ this.renderPolicyNotice() }
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
			fetchTaxRates,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( TaxesRates ) );
