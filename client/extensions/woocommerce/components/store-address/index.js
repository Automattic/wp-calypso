/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Card from 'components/card';
import Dialog from 'components/dialog';
import { successNotice, errorNotice } from 'state/notices/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getCountryData } from 'woocommerce/lib/countries';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getStoreLocation, areSettingsGeneralLoading } from 'woocommerce/state/sites/settings/general/selectors';
import { setAddress } from 'woocommerce/state/sites/settings/actions';
import FormLabel from 'components/forms/form-label';

class StoreAddress extends Component {

	static defaultProps = {
		showLabel: true,
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

		this.setState( { address: newProps.address } );
	}

	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false,
			address: props.address,
		};
	}

	onChange = ( event ) => {
		const addressEdits = { ...this.state.addressEdits };
		const addressKey = event.target.name;
		const newValue = event.target.value;
		addressEdits[ addressKey ] = newValue;
		// Did they change the country? Force an appropriate state default
		if ( 'country' === addressKey ) {
			const countryData = getCountryData( newValue );
			addressEdits.state = countryData ? countryData.defaultState : '';
		}

		this.setState( { addressEdits } );
	}

	onShowDialog = () => {
		this.setState( {
			showDialog: true,
			addressEdits: { ...this.props.address },
		} );
	}

	onCloseDialog = ( action ) => {
		const { translate, site, onSetAddress } = this.props;
		if ( 'save' === action ) {
			const onFailure = () => {
				this.setState( { showDialog: false } );
				return errorNotice( translate( 'There was a problem saving the store address. Please try again.' ) );
			};
			const onSuccess = () => {
				if ( onSetAddress ) {
					onSetAddress( this.state.addressEdits );
				}
				return successNotice( translate( 'Address saved.' ), { duration: 4000 } );
			};
			this.setState( {
				showDialog: false,
				address: { ...this.state.addressEdits },
			} );
			this.props.setAddress(
				site.ID,
				this.state.addressEdits.street,
				this.state.addressEdits.street2,
				this.state.addressEdits.city,
				this.state.addressEdits.state,
				this.state.addressEdits.postcode,
				this.state.addressEdits.country,
				onSuccess,
				onFailure
			);
		} else {
			this.setState( {
				showDialog: false,
			} );
		}
	}

	render() {
		const { className, site, loading, translate, showLabel } = this.props;

		const buttons = [
			{ action: 'close', label: translate( 'Close' ) },
			{ action: 'save', label: translate( 'Save' ), isPrimary: true },
		];

		let display;
		if ( ! site || loading ) {
			display = (
				<div>
					<p></p>
					<p></p>
					<p></p>
					<p></p>
				</div>
			);
		} else {
			display = (
				<div>
					{ showLabel && (
						<FormLabel>{ translate( 'Store location' ) }</FormLabel>
					) }
					<AddressView address={ this.state.address } />
					<a onClick={ this.onShowDialog }>{ translate( 'Edit address' ) }</a>
				</div>
			);
		}

		const classes = classNames( 'store-address', { 'is-placeholder': ! site || loading }, className );
		return (
			<Card className={ classes }>
				<Dialog
					buttons={ buttons }
					isVisible={ this.state.showDialog }
					onClose={ this.onCloseDialog }
					additionalClassNames="woocommerce store-location__edit-dialog"
					><AddressView address={ this.state.addressEdits } isEditable onChange={ this.onChange } />
				</Dialog>
				{ display }
			</Card>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const loading = areSettingsGeneralLoading( state );
	const address = getStoreLocation( state );
	return {
		site,
		address,
		loading,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSettingsGeneral,
			setAddress,
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( StoreAddress ) );
