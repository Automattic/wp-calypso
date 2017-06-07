/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormSelect from 'components/forms/form-select';

import { getSelectedSiteId } from 'state/ui/selectors';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';

class SettingsPaymentsLocationCurrency extends Component {
	static propTypes = {
		currency: PropTypes.shape( {
			options: PropTypes.object,
			value: PropTypes.string,
		} ),
		fetchSettingsGeneral: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
	};

	componentDidMount() {
		const { siteId } = this.props;
		this.props.fetchSettingsGeneral( siteId );
	}

	constructor( props ) {
		super( props );

		//TODO: use redux state and real data
		this.state = {
			address: {
				name: 'Octopus Outlet Emporium',
				street: '27 Main Street',
				city: 'Ellington, CT 06029',
				country: 'United States'
			},
		};
	}

	renderOption = ( option, options ) => {
		return (
			<option key={ option } value={ option }>
				{ options[ option ] }
			</option>
		);
	}

	render() {
		const { currency, translate } = this.props;
		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Store location and currency' ) }
					description={
						translate(
							'Different payment methods may be available based on your store' +
							'location and currency.'
						)
					} />
				<Card>
					<AddressView
						address={ this.state.address } />

					<FormSelect className="payments__currency-select" value={ currency.value }>
						{
							currency.options &&
							Object.keys( currency.options ).map(
								( o ) => this.renderOption( o, currency.options )
							)
						}
					</FormSelect>
				</Card>
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const currency = getPaymentCurrencySettings( state, siteId );
	return {
		currency,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsLocationCurrency ) );
