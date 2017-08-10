/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { errorNotice } from 'state/notices/actions';
import { getCountryData, getCountries } from 'woocommerce/lib/countries';
import { setSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';
import { doInitialSetup } from 'woocommerce/state/sites/settings/actions';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class PreSetupView extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			address: props.address,
			isSaving: false,
			userBeganEditing: false,
		};
	}

	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	componentWillReceiveProps = newProps => {
		if ( ! this.state.userBeganEditing ) {
			this.setState( { address: newProps.address } );
		}
	};

	onChange = event => {
		const addressKey = event.target.name;
		const newValue = event.target.value;

		const address = this.state.address;
		address[ addressKey ] = newValue;

		// Did they change the country? Force an appropriate state default
		if ( 'country' === addressKey ) {
			const countryData = getCountryData( newValue );
			address.state = countryData ? countryData.defaultState : '';
		}

		this.setState( { address, userBeganEditing: true } );
	};

	onNext = event => {
		const { site, translate } = this.props;
		event.preventDefault();
		this.setState( { isSaving: true } );

		// TODO before attempting to set the address, make sure all required
		// plugins are installed and activated

		const onSuccess = () => {
			this.setState( { isSaving: false } );
			return setSetStoreAddressDuringInitialSetup( this.props.site.ID, true );
		};

		const onFailure = () => {
			this.setState( { isSaving: false } );
			return errorNotice(
				translate( 'There was a problem saving the store address. Please try again.' )
			);
		};

		// Provides fallbacks if the country & state options were never changed/toggled,
		// or if an unsupported country was set in state (like WC's default GB country)
		let country = null;
		let state = null;
		if (
			! this.state.address.country ||
			! find( getCountries(), { code: this.state.address.country } )
		) {
			country = 'US';
			const countryData = getCountryData( country );
			state = this.state.address.state ? this.state.address.state : countryData.defaultState;
		} else {
			country = this.state.address.country;
			state = this.state.address.state;
		}

		this.props.doInitialSetup(
			site.ID,
			this.state.address.street,
			this.state.address.street2,
			this.state.address.city,
			state,
			this.state.address.postcode,
			country,
			onSuccess,
			onFailure
		);
	};

	render = () => {
		const { loaded, site, translate } = this.props;

		if ( ! loaded ) {
			// TODO - maybe a loading placehoder
			return <QuerySettingsGeneral siteId={ site && site.ID } />;
		}

		return (
			<div className="card dashboard__setup-wrapper dashboard__location">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Howdy! Ready to start selling?' ) }
					subtitle={ translate( 'First we need to know where you are in the world.' ) }
				/>
				<AddressView
					address={ this.state.address }
					className="dashboard__pre-setup-address"
					isEditable
					onChange={ this.onChange }
				/>
				<SetupFooter
					disabled={ this.state.isSaving }
					onClick={ this.onNext }
					label={ translate( "Let's Go!" ) }
					primary
				/>
			</div>
		);
	};
}

function mapStateToProps( state, ownProps ) {
	let loaded = false;
	let address = {};

	if ( ownProps.site ) {
		address = getStoreLocation( state, ownProps.site.ID );
		loaded = areSettingsGeneralLoaded( state, ownProps.site.ID );
	}

	return {
		address,
		loaded,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			doInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PreSetupView ) );
