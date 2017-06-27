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
import AddressView from 'woocommerce/components/address-view';
import {
	areSettingsGeneralLoading,
	getStoreLocation
} from 'woocommerce/state/sites/settings/general/selectors';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import {
	fetchSettingsGeneral,
	updateStoreAddress
} from 'woocommerce/state/sites/settings/general/actions';
import { getSiteTitle } from 'state/sites/selectors';

class TaxesNexus extends Component {

	static propTypes = {
		site: PropTypes.shape( {
			slug: PropTypes.string,
		} ),
	};

	componentDidMount = () => {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	onEditAddress = ( event ) => {
		event.preventDefault();
		// TODO - modal up
	}

	render = () => {
		const { address, loading, translate } = this.props;

		if ( loading ) {
			return null;
		}

		return (
			<div className="taxes__taxes-nexus">
				<ExtendedHeader
					label={ translate( 'Store address' ) }
				/>
				<Card>
					<AddressView address={ address } />
					<a onClick={ this.onEditAddress }>{ translate( 'Edit address' ) }</a>
				</Card>
			</div>
		);
	}

}

function mapStateToProps( state, ownProps ) {
	let name = '';
	let storeLocation = {};
	let loading = true;

	if ( ownProps.site ) {
		name = getSiteTitle( state, ownProps.site.ID );
		storeLocation = getStoreLocation( state, ownProps.site.ID );
		loading = areSettingsGeneralLoading( state, ownProps.site.ID );
	}

	const address = {
		name,
		...storeLocation,
	};

	return {
		address,
		loading,
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( TaxesNexus ) );
