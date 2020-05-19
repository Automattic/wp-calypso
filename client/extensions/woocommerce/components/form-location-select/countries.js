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
	getCountriesByContinent,
} from 'woocommerce/state/sites/data/locations/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { sortPopularCountriesToTop } from 'woocommerce/lib/countries';

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
			<option key={ `${ option.continent }-${ option.code }` } value={ option.code }>
				{ option.name }
			</option>
		);
	};

	render() {
		const { locationsList, onChange, translate, value } = this.props;

		return (
			<div>
				<FormLabel htmlFor="country">{ translate( 'Country' ) }</FormLabel>
				<FormSelect
					autoComplete="country-code"
					id="country"
					name="country"
					onChange={ onChange }
					value={ value }
				>
					<option key="default" value="" disabled>
						{ translate( 'Select Country' ) }
					</option>
					{ locationsList.map( this.renderOption ) }
				</FormSelect>
			</div>
		);
	}
}

// TODO Move this to a proper selector (with tests)
// https://github.com/Automattic/wp-calypso/pull/24571#discussion_r185268996
const getContinentsWithCountries = ( state, continents, siteId ) => {
	const locationsList = [];
	continents.forEach( ( continent ) => {
		const countries = getCountriesByContinent( state, continent.code, siteId );
		locationsList.push(
			...countries.map( ( country ) => ( {
				...country,
				continent: continent.code,
			} ) )
		);
	} );
	return locationsList;
};

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site.ID || null;
		const address = getStoreLocation( state );
		const areSettingsLoaded = areSettingsGeneralLoaded( state );
		const value = ! props.value ? address.country : props.value;

		const isLoaded = areLocationsLoaded( state, siteId );
		const continents = getContinents( state, siteId );
		const locationsList = getContinentsWithCountries( state, continents, siteId );

		return {
			areSettingsLoaded,
			isLoaded,
			locationsList: sortPopularCountriesToTop( locationsList ),
			siteId,
			value,
		};
	},
	( dispatch ) => bindActionCreators( { fetchLocations, fetchSettingsGeneral }, dispatch )
)( localize( FormCountrySelectFromApi ) );
