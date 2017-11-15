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
} from 'woocommerce/state/sites/locations/selectors';
import { decodeEntities } from 'lib/formatting';
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
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

	componentWillMount() {
		const { siteId, isLoaded } = this.props;

		if ( siteId && ! isLoaded ) {
			this.props.fetchLocations( siteId );
		}
	}

	componentWillReceiveProps( { siteId } ) {
		if ( siteId !== this.props.siteId ) {
			this.props.fetchLocations( siteId );
		}
	}

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
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site.ID || null;
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
			siteId,
			locationsList: sortPopularCountriesToTop( locationsList ),
			isLoaded,
		};
	},
	dispatch => bindActionCreators( { fetchLocations }, dispatch )
)( localize( FormCountrySelectFromApi ) );
