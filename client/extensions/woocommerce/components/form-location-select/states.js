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
import { areLocationsLoaded, getStates } from 'woocommerce/state/sites/locations/selectors';
import { decodeEntities } from 'lib/formatting';
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
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
			<option key={ option.code } value={ option.code }>
				{ decodeEntities( option.name ) }
			</option>
		);
	};

	renderDisabled = () => {
		const { translate } = this.props;
		return (
			<FormSelect disabled>
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
					<FormSelect id="state" name="state" onChange={ onChange } value={ value }>
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
		const { country } = props;
		const site = getSelectedSiteWithFallback( state );
		const siteId = site.ID || null;
		const isLoaded = areLocationsLoaded( state, siteId );
		const locationsList = getStates( state, country, siteId );

		return {
			siteId,
			locationsList,
			isLoaded,
		};
	},
	dispatch => bindActionCreators( { fetchLocations }, dispatch )
)( localize( FormStateSelectFromApi ) );
