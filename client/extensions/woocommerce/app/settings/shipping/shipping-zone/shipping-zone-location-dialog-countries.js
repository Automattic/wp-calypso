/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { startsWith } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import { decodeEntities } from 'lib/formatting';
import BulkSelect from 'woocommerce/components/bulk-select';
import FilteredList from 'woocommerce/components/filtered-list';
import LocationFlag from 'woocommerce/components/location-flag';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { toggleContinentSelected, toggleCountrySelected } from 'woocommerce/state/ui/shipping/zones/locations/actions';
import { getCurrentlyEditingShippingZoneCountries } from 'woocommerce/state/ui/shipping/zones/locations/selectors';

const ShippingZoneLocationDialogCountries = ( { continentCountries, translate, actions } ) => {
	const renderCountryLocation = ( location, index ) => {
		const { type, code, name, selected, disabled } = location;
		const isCountry = 'country' === type;
		//show continents as selected if all countries have been selected
		const uiSelected = selected || ( ! isCountry && location.countryCount === location.selectedCountryCount );

		const onToggle = ( event ) => {
			event.stopPropagation && event.stopPropagation();
			if ( disabled ) {
				return;
			}

			( isCountry ? actions.toggleCountrySelected : actions.toggleContinentSelected )( code, ! uiSelected );
		};

		const checkboxClass = classNames(
			'shipping-zone__location-dialog-list-item-checkbox',
			{ 'is-country': isCountry }
		);

		const listItemClass = disabled
			? 'shipping-zone__location-dialog-list-item is-disabled' : 'shipping-zone__location-dialog-list-item';

		return (
			<li key={ index } className={ listItemClass } onClick={ onToggle }>
				{ isCountry
					? <FormCheckbox
						readOnly
						className={ checkboxClass }
						checked={ uiSelected }
						disabled={ disabled } />
					: <BulkSelect
						totalElements={ location.countryCount }
						selectedElements={ location.selectedCountryCount }
						readOnly
						className={ checkboxClass }
						disabled={ disabled } /> }
				{ isCountry ? <LocationFlag code={ code } /> : null }
				<span>{ decodeEntities( name ) }</span>
				{ disabled && (
					<small>{ translate( '(An existing zone covers this location)' ) }</small>
				) }
			</li>
		);
	};

	const countryFilter = ( item, filter ) => {
		if ( 'continent' === item.type ) {
			return true;
		}

		return startsWith( item.name.toLowerCase(), filter.toLowerCase() );
	};

	return (
		<FormFieldSet>
			<FormLabel>{ translate( 'Location' ) }</FormLabel>
			<FilteredList
				items={ continentCountries }
				customFilter={ countryFilter }
				renderItem={ renderCountryLocation }
				placeholder={ translate( 'Filter by country from the list below' ) } />
		</FormFieldSet>
	);
};

ShippingZoneLocationDialogCountries.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => ( {
		continentCountries: getCurrentlyEditingShippingZoneCountries( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			toggleContinentSelected,
			toggleCountrySelected,
		}, dispatch, ownProps.siteId )
	} )
)( localize( ShippingZoneLocationDialogCountries ) );
