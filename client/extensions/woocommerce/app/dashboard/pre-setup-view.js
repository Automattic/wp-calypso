/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import {
	areSettingsGeneralLoading,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { errorNotice } from 'state/notices/actions';
import { fetchSettingsGeneral, updateStoreAddress } from 'woocommerce/state/sites/settings/general/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSiteTitle } from 'state/sites/selectors';
import { setSetStoreAddressDuringInitialSetup } from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';

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

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { site } = this.props;
		const newSiteId = site.selectedSite ? newProps.selectedSite.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( newSiteId && ( oldSiteId !== newSiteId ) ) {
			this.props.fetchSettingsGeneral( newSiteId );
		}

		if ( ! this.state.userBeganEditing ) {
			this.setState( { address: newProps.address } );
		}
	}

	onChange = ( event ) => {
		const address = this.state.address;
		address[ event.target.name ] = event.target.value;
		this.setState( { address, userBeganEditing: true } );
	}

	onNext = ( event ) => {
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
			return errorNotice( translate( 'There was a problem saving the store address. Please try again.' ) );
		};

		this.props.updateStoreAddress(
			site.ID,
			this.state.address.street,
			this.state.address.street2,
			this.state.address.city,
			this.state.address.state,
			this.state.address.postcode,
			this.state.address.country,
			onSuccess,
			onFailure
		);
	}

	render = () => {
		const { loading, site, translate } = this.props;

		if ( ! site || loading ) {
			// TODO - maybe a loading placehoder
			return null;
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
					label={ translate( 'Let\'s Go!' ) }
					primary
				/>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	let name = '';
	if ( site ) {
		name = getSiteTitle( state, site.ID );
	}
	const storeLocation = getStoreLocation( state );
	const address = {
		name,
		...storeLocation,
	};
	const loading = areSettingsGeneralLoading( state );

	return {
		address,
		loading,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
			updateStoreAddress,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PreSetupView ) );
