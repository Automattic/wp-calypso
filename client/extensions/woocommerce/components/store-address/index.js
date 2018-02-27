/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Button from 'components/button';
import Card from 'components/card';
import Dialog from 'components/dialog';
import { successNotice, errorNotice } from 'state/notices/actions';
import { areLocationsLoaded, getAllCountries } from 'woocommerce/state/sites/locations/selectors';
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getStoreLocation,
	areSettingsGeneralLoaded,
	areSettingsGeneralLoadError,
} from 'woocommerce/state/sites/settings/general/selectors';
import { setAddress } from 'woocommerce/state/sites/settings/actions';
import FormLabel from 'components/forms/form-label';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class StoreAddress extends Component {
	static defaultProps = {
		showLabel: true,
	};

	componentWillReceiveProps = newProps => {
		this.setState( { address: newProps.address } );
	};

	maybeFetchLocations = props => {
		const { loadedLocations, siteId } = props;

		if ( ! loadedLocations && siteId ) {
			this.props.fetchLocations( siteId );
		}
	};

	componentDidMount = () => {
		this.maybeFetchLocations( this.props );
	};

	componentDidUpdate = () => {
		this.maybeFetchLocations( this.props );
	};

	constructor( props ) {
		super( props );
		this.state = {
			showDialog: false,
			address: props.address,
		};
	}

	onChange = event => {
		const { countries } = this.props;

		const addressEdits = { ...this.state.addressEdits };
		const addressKey = event.target.name;
		const newValue = event.target.value;
		addressEdits[ addressKey ] = newValue;

		// Did they change the country? Force an appropriate state default
		if ( 'country' === addressKey ) {
			const countryData = find( countries, { code: newValue } );
			if ( countryData ) {
				if ( ! isEmpty( countryData.states ) ) {
					addressEdits.state = countryData.states[ 0 ].code;
				}
			}
		}

		this.setState( { addressEdits } );
	};

	onShowDialog = () => {
		this.setState( {
			showDialog: true,
			addressEdits: { ...this.props.address },
		} );
	};

	onCloseDialog = action => {
		const { translate, siteId, onSetAddress } = this.props;
		if ( 'save' === action ) {
			const onFailure = () => {
				this.setState( { showDialog: false } );
				return errorNotice(
					translate( 'There was a problem saving the store address. Please try again.' )
				);
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
				siteId,
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
	};

	render() {
		const { className, countries, siteId, loaded, fetchError, translate, showLabel } = this.props;

		const buttons = [
			{ action: 'close', label: translate( 'Close' ) },
			{ action: 'save', label: translate( 'Save' ), isPrimary: true },
		];

		let display;
		if ( ! siteId || ! loaded || fetchError ) {
			display = (
				<div>
					<p />
					<p />
					<p />
					<p />
				</div>
			);
		} else {
			display = (
				<div>
					{ showLabel && <FormLabel>{ translate( 'Store location' ) }</FormLabel> }
					<AddressView address={ this.state.address } countries={ countries } />
					<Button compact onClick={ this.onShowDialog }>
						{ translate( 'Edit address' ) }
					</Button>
				</div>
			);
		}

		const classes = classNames(
			'store-address',
			{ 'is-placeholder': ! siteId || ! loaded },
			className
		);
		return (
			<Card className={ classes }>
				<QuerySettingsGeneral siteId={ siteId } />
				<Dialog
					buttons={ buttons }
					isVisible={ this.state.showDialog }
					onClose={ this.onCloseDialog }
					additionalClassNames="woocommerce store-location__edit-dialog"
				>
					<AddressView
						address={ this.state.addressEdits }
						countries={ countries }
						isEditable
						onChange={ this.onChange }
					/>
				</Dialog>
				{ display }
			</Card>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : false;

	const loadedLocations = areLocationsLoaded( state, siteId );
	const loadedSettingsGeneral = areSettingsGeneralLoaded( state, siteId );
	const loaded = loadedLocations && loadedSettingsGeneral;

	const fetchError = areSettingsGeneralLoadError( state );
	const countries = getAllCountries( state, siteId );

	const address = getStoreLocation( state, siteId );
	return {
		address,
		countries,
		fetchError,
		loaded,
		loadedLocations,
		loadedSettingsGeneral,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchLocations,
			setAddress,
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( StoreAddress ) );
