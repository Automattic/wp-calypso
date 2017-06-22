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
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';

import {
	setSetStoreAddressDuringInitialSetup,
} from 'woocommerce/state/sites/setup-choices/actions';

class PreSetupView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
		} ),
	};

	onChange = ( /* event */ ) => {
		// TODO - store changes in state
	}

	onNext = ( event ) => {
		// TODO - save the address to the site
		event.preventDefault();
		// TODO - maybe make button disabled while saving
		this.props.setSetStoreAddressDuringInitialSetup( this.props.site.ID, true );
	}

	render = () => {
		const { translate } = this.props;

		// TODO - use state, initialized from props passed in by redux
		// to provide props to the address view and then remove this hardcoding

		const address = {
			name: 'Octopus Outlet Emporium',
			street: '27 Main St',
			street2: '',
			city: 'Ellington',
			state: 'CT',
			postcode: '06029',
			country: 'US',
		};

		return (
			<div className="card dashboard__setup-wrapper dashboard__location">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Howdy! Let\'s set up your store & start selling' ) }
					subtitle={ translate( 'First we need to know where you\'re located.' ) }
				/>
				<AddressView
					address={ address }
					className="dashboard__pre-setup-address"
					isEditable
					onChange={ this.onChange }
				/>
				<SetupFooter
					onClick={ this.onNext }
					label={ translate( 'Next' ) }
					primary
				/>
			</div>
		);
	}
}

function mapStateToProps( /* state */ ) {
	return {
		// TODO - get actual address from state
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			setSetStoreAddressDuringInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( PreSetupView ) );
