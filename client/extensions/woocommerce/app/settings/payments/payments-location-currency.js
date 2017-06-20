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
import { errorNotice, successNotice } from 'state/notices/actions';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormSelect from 'components/forms/form-select';
import { changeCurrency } from 'woocommerce/state/ui/payments/currency/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { fetchSettingsGeneral, saveCurrency } from 'woocommerce/state/sites/settings/general/actions';

class SettingsPaymentsLocationCurrency extends Component {
	static propTypes = {
		changeCurrency: PropTypes.func.isRequired,
		currency: PropTypes.string,
		currencySettings: PropTypes.shape( {
			options: PropTypes.object,
			value: PropTypes.string,
		} ),
		fetchSettingsGeneral: PropTypes.func.isRequired,
		getCurrencyWithEdits: PropTypes.func.isRequired,
		saveCurrency: PropTypes.func.isRequired,
		site: PropTypes.object,
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;

		const newSiteId = newProps.site && newProps.site.ID || null;
		const oldSiteId = site && site.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSettingsGeneral( newSiteId );
		}
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

	onChange = ( e ) => {
		const { site, translate } = this.props;
		const newCurrency = e.target.value;
		this.props.changeCurrency(
			site.ID,
			newCurrency
		);
		const successAction = () => {
			return successNotice(
				translate( 'Site currency successfully saved.' ),
				{ duration: 4000 }
			);
		};

		const errorAction = () => {
			return errorNotice(
				translate( 'There was a problem saving the currency. Please try again.' )
			);
		};

		this.props.saveCurrency(
			site.ID,
			newCurrency,
			successAction,
			errorAction
		);
	}

	render() {
		const { currency, currencySettings, translate } = this.props;
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

					<FormSelect
						className="payments__currency-select"
						onChange={ this.onChange }
						value={ currency }>
						{
							currencySettings.options &&
							Object.keys( currencySettings.options ).map(
								( o ) => this.renderOption( o, currencySettings.options )
							)
						}
					</FormSelect>
				</Card>
			</div>
		);
	}

}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const currencySettings = getPaymentCurrencySettings( state );
	const currency = getCurrencyWithEdits( state );
	return {
		currency,
		currencySettings,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			changeCurrency,
			fetchSettingsGeneral,
			getCurrencyWithEdits,
			saveCurrency,
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( SettingsPaymentsLocationCurrency ) );
