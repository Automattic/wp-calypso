/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty, round } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	areSettingsGeneralLoaded,
	areTaxCalculationsEnabled,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { areTaxRatesLoaded, getTaxRates } from 'woocommerce/state/sites/meta/taxrates/selectors';
import Card from 'components/card';
import { getCountryData, getStateData } from 'woocommerce/lib/countries';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ExternalLink from 'components/external-link';
import { fetchTaxRates } from 'woocommerce/state/sites/meta/taxrates/actions';
import FormToggle from 'components/forms/form-toggle';
import Notice from 'components/notice';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class TaxesRates extends Component {
	static propTypes = {
		onEnabledChange: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	maybeFetchRates = props => {
		const { address, loadedSettingsGeneral, loadedTaxRates, siteId } = props;

		if ( loadedSettingsGeneral && ! loadedTaxRates ) {
			this.props.fetchTaxRates( siteId, address );
		}
	};

	componentDidMount = () => {
		this.maybeFetchRates( this.props );
	};

	componentWillReceiveProps = nextProps => {
		this.maybeFetchRates( nextProps );
	};

	renderLocation = () => {
		const { address, areTaxesEnabled, translate } = this.props;
		if ( ! areTaxesEnabled ) {
			return null;
		}

		const countryData = getCountryData( address.country );
		if ( ! countryData ) {
			return (
				<p>
					{ translate( 'Error: Your country ( %(country)s ) is not recognized', {
						args: { country: address.country },
					} ) }
				</p>
			);
		}

		const countryName = countryData.name;
		const stateData = getStateData( address.country, address.state );
		if ( ! stateData ) {
			return (
				<p>
					{ translate(
						'Error: Your country ( %(countryName)s ) was recognized, but ' +
							'your state ( %(state)s ) was not. ',
						{ args: { countryName, state: address.state } }
					) }
				</p>
			);
		}

		const stateName = stateData.name;

		return (
			<p>
				{ translate(
					"The following tax rates are in effect at your store's location in " +
						'{{strong}}%(stateName)s, %(countryName)s{{/strong}}',
					{
						args: { stateName, countryName },
						components: { strong: <strong /> },
					}
				) }
			</p>
		);
	};

	renderCalculationStatus = () => {
		const { address, areTaxesEnabled, translate } = this.props;
		const stateData = getStateData( address.country, address.state );

		if ( ! stateData ) {
			return null;
		}

		if ( ! areTaxesEnabled ) {
			return (
				<Notice showDismiss={ false } status="is-warning">
					{ translate(
						'Sales taxes are not currently being charged. Unless ' +
							'your store or products are exempt from sales tax we recommend that you ' +
							'{{strong}}enable automatic tax calculation and charging{{/strong}}',
						{
							components: { strong: <strong /> },
						}
					) }
				</Notice>
			);
		}

		return (
			<div className="taxes__taxes-calculate">
				<Gridicon icon="checkmark" />
				{ translate(
					"We'll automatically calculate and charge sales tax " + 'each time a customer checks out.'
				) }
			</div>
		);
	};

	possiblyRenderRates = () => {
		const { address, areTaxesEnabled, taxRates, translate } = this.props;
		if ( ! areTaxesEnabled ) {
			return null;
		}

		const stateData = getStateData( address.country, address.state );
		if ( ! stateData ) {
			return null;
		}

		if ( isEmpty( taxRates ) ) {
			return (
				<Notice showDismiss={ false } status="is-error">
					{ translate(
						'The WordPress.com sales tax rate service is not available for this site.'
					) }
				</Notice>
			);
		}

		let state_rate = 'state_rate' in taxRates ? parseFloat( taxRates.state_rate ) : 0;
		let combined_rate = 'combined_rate' in taxRates ? parseFloat( taxRates.combined_rate ) : 0;
		let local_rate = combined_rate - state_rate;

		state_rate = round( state_rate * 100, 2 );
		combined_rate = round( combined_rate * 100, 2 );
		local_rate = round( local_rate * 100, 2 );

		const rates = [];

		if ( 0 < state_rate ) {
			rates.push( {
				name: translate( 'State Tax' ),
				rate: state_rate,
			} );
			if ( 0 < local_rate ) {
				rates.push( {
					name: translate( 'Local Tax' ),
					rate: local_rate,
				} );
			}
		}

		rates.push( {
			name: translate( 'Total Tax' ),
			rate: combined_rate,
		} );

		return (
			<Table className="taxes__taxes-rates-table">
				<TableRow isHeader>
					<TableItem isHeader>{ translate( 'Name' ) }</TableItem>
					<TableItem isHeader>{ translate( 'Rate' ) }</TableItem>
				</TableRow>
				{ rates.map( ( row, i ) => (
					<TableRow key={ i }>
						<TableItem key={ i }>{ row.name }</TableItem>
						<TableItem key={ i + 1 }>{ row.rate }%</TableItem>
					</TableRow>
				) ) }
			</Table>
		);
	};

	renderPolicyNotice = () => {
		const { translate } = this.props;

		return (
			<div className="taxes__taxes-taxjar-notice">
				{ translate(
					'Sales tax calculations are provided by WooCommerce Services. When this option is enabled, ' +
						'WooCommerce Services will share some of your data with a third party.'
				) }
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
	};

	render = () => {
		const {
			siteId,
			loadedSettingsGeneral,
			loadedTaxRates,
			onEnabledChange,
			taxesEnabled,
			translate,
		} = this.props;

		if ( ! loadedSettingsGeneral ) {
			return <QuerySettingsGeneral siteId={ siteId } />;
		}

		if ( ! loadedTaxRates ) {
			return null;
		}

		const toggleMessage = translate( 'Tax calculations enabled' );

		return (
			<div className="taxes__taxes-rates">
				<ExtendedHeader label={ translate( 'Tax rates' ) }>
					<FormToggle name="taxesEnabled" onChange={ onEnabledChange } checked={ taxesEnabled }>
						<span className="taxes__taxes-calculate-label">{ toggleMessage }</span>
					</FormToggle>
				</ExtendedHeader>
				<Card>
					{ this.renderCalculationStatus() }
					{ this.renderLocation() }
					{ this.possiblyRenderRates() }
					{ this.renderPolicyNotice() }
				</Card>
			</div>
		);
	};
}

function mapStateToProps( state, ownProps ) {
	const address = getStoreLocation( state, ownProps.siteId );
	const loadedSettingsGeneral = areSettingsGeneralLoaded( state, ownProps.siteId );
	const areTaxesEnabled = areTaxCalculationsEnabled( state, ownProps.siteId );
	const loadedTaxRates = areTaxRatesLoaded( state, ownProps.siteId );
	const taxRates = getTaxRates( state, ownProps.siteId );

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
