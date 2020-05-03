/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { areLocationsLoaded, getStates } from 'woocommerce/state/sites/data/locations/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

class FormStateSelectFromApi extends Component {
	static propTypes = {
		country: PropTypes.string.isRequired,
		isLoaded: PropTypes.bool.isRequired,
		locationsList: PropTypes.arrayOf(
			PropTypes.shape( {
				code: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
			} )
		),
		onChange: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
		value: PropTypes.string,
	};

	UNSAFE_componentWillMount() {
		this.fetchData( this.props );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.fetchData( newProps );
		}
	}

	fetchData = ( { siteId, isLoaded, areSettingsLoaded } ) => {
		if ( ! siteId ) {
			return;
		}
		if ( ! isLoaded ) {
			this.props.fetchLocations( siteId );
		}
		if ( ! areSettingsLoaded ) {
			this.props.fetchSettingsGeneral( siteId );
		}
	};

	renderOption = ( option ) => {
		return (
			<option key={ option.code } value={ option.code }>
				{ option.name }
			</option>
		);
	};

	renderDisabled = () => {
		const { translate } = this.props;
		return (
			<FormSelect autoComplete="off" disabled>
				<option>
					{ translate( 'N/A', { comment: "The currently-selected country doesn't have states" } ) }
				</option>
			</FormSelect>
		);
	};

	render() {
		const { country, locationsList, isLoaded, onChange, translate, value } = this.props;
		let statesLabel = translate( 'State' );
		if ( 'CA' === country ) {
			statesLabel = translate( 'Province' );
		}

		return (
			<div>
				<FormLabel htmlFor="state">{ statesLabel }</FormLabel>
				{ isLoaded && ! locationsList.length ? (
					this.renderDisabled()
				) : (
					<FormSelect
						autoComplete="address-level1"
						id="state"
						name="state"
						onChange={ onChange }
						value={ value }
					>
						<option key="default" value="" disabled>
							{ translate( 'Select State', {
								comment: 'Label for customer address, state/province dropdown',
							} ) }
						</option>
						{ locationsList.map( this.renderOption ) }
					</FormSelect>
				) }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const address = getStoreLocation( state );
		const areSettingsLoaded = areSettingsGeneralLoaded( state );

		let { country, value } = props;
		// If (state) value or country are empty, use the store's address
		// Note: We only want to use te store's state if we are using
		// the store's country, to avoid potential country-state mismatch
		if ( isEmpty( country ) ) {
			country = address.country; // use the store's country
			if ( isEmpty( value ) ) {
				value = address.state; // use the store's state
			}
		}

		const site = getSelectedSiteWithFallback( state );
		const siteId = site.ID || null;
		const isLoaded = areLocationsLoaded( state, siteId );
		const locationsList = getStates( state, country, siteId );

		return {
			areSettingsLoaded,
			country,
			isLoaded,
			locationsList,
			siteId,
			value,
		};
	},
	( dispatch ) => bindActionCreators( { fetchLocations, fetchSettingsGeneral }, dispatch )
)( localize( FormStateSelectFromApi ) );
