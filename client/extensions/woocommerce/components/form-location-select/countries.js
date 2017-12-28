/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import {
	areLocationsLoaded,
	getContinents,
	getCountries,
} from 'client/extensions/woocommerce/state/sites/locations/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'client/extensions/woocommerce/state/sites/settings/general/selectors';
import { decodeEntities } from 'client/lib/formatting';
import { fetchLocations } from 'client/extensions/woocommerce/state/sites/locations/actions';
import { fetchSettingsGeneral } from 'client/extensions/woocommerce/state/sites/settings/general/actions';
import FormLabel from 'client/components/forms/form-label';
import FormSelect from 'client/components/forms/form-select';
import { getSelectedSiteWithFallback } from 'client/extensions/woocommerce/state/sites/selectors';
import { sortPopularCountriesToTop } from 'client/extensions/woocommerce/lib/countries';

class FormCountrySelectFromApi extends Component {
	static propTypes = {
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
		value: PropTypes.string.isRequired,
	};

	componentWillMount() {
		this.fetchData( this.props );
	}

	componentWillReceiveProps( newProps ) {
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

	renderOption = option => {
		return (
			<option key={ `${ option.continent }-${ option.code }` } value={ option.code }>
				{ decodeEntities( option.name ) }
			</option>
		);
	};

	render() {
		const { locationsList, onChange, translate, value } = this.props;

		return (
			<div>
				<FormLabel htmlFor="country">{ translate( 'Country' ) }</FormLabel>
				<FormSelect id="country" name="country" onChange={ onChange } value={ value }>
					<option key="default" value="" disabled>
						{ translate( 'Select Country' ) }
					</option>
					{ locationsList.map( this.renderOption ) }
				</FormSelect>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site.ID || null;
		const address = getStoreLocation( state );
		const areSettingsLoaded = areSettingsGeneralLoaded( state );
		const value = ! props.value ? address.country : props.value;

		const locationsList = [];
		const isLoaded = areLocationsLoaded( state, siteId );
		const continents = getContinents( state, siteId );
		continents.forEach( continent => {
			const countries = getCountries( state, continent.code, siteId );
			locationsList.push(
				...countries.map( country => ( {
					...country,
					continent: continent.code,
				} ) )
			);
		} );

		return {
			areSettingsLoaded,
			isLoaded,
			locationsList: sortPopularCountriesToTop( locationsList ),
			siteId,
			value,
		};
	},
	dispatch => bindActionCreators( { fetchLocations, fetchSettingsGeneral }, dispatch )
)( localize( FormCountrySelectFromApi ) );
