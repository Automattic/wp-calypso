/**
 * /* eslint wpcalypso/i18n-ellipsis: 0
 *
 * @format
 */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FilteredList from 'woocommerce/components/filtered-list';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { decodeEntities } from 'lib/formatting';
import {
	getShippingZoneLocationsWithEdits,
	canLocationsBeFiltered,
	canLocationsBeFilteredByState,
	areLocationsFilteredByPostcode,
	areLocationsFilteredByState,
	areLocationsUnfiltered,
	getCurrentlyEditingShippingZoneStates,
	getCurrentSelectedCountryZoneOwner,
} from 'woocommerce/state/ui/shipping/zones/locations/selectors';
import {
	filterByWholeCountry,
	filterByState,
	filterByPostcode,
	toggleStateSelected,
	editPostcode,
} from 'woocommerce/state/ui/shipping/zones/locations/actions';

const ShippingZoneLocationDialogSettings = ( {
	canFilter,
	unfiltered,
	filteredByPostcode,
	canFilterByState,
	filteredByState,
	states,
	postcode,
	countryOwner,
	translate,
	actions,
} ) => {
	const onWholeCountrySelect = event => {
		event.stopPropagation();
		actions.filterByWholeCountry();
	};
	const onStateSelect = event => {
		event.stopPropagation();
		actions.filterByState();
	};
	const onPostcodeSelect = event => {
		event.stopPropagation();
		actions.filterByPostcode();
	};

	const renderRadios = () => {
		if ( ! canFilter ) {
			return (
				<div>
					<FormRadio disabled={ true } checked={ true } readOnly={ true } />
					{ translate( 'Include entire countries in the zone' ) }
				</div>
			);
		}

		const radios = [
			<div key={ 1 } onClick={ onPostcodeSelect }>
				<FormRadio onChange={ onPostcodeSelect } checked={ filteredByPostcode } />
				{ translate( 'Include specific postcodes in the zone' ) }
			</div>,
		];

		if ( ! countryOwner ) {
			radios.unshift(
				<div key={ 0 } onClick={ onWholeCountrySelect }>
					<FormRadio onChange={ onWholeCountrySelect } checked={ unfiltered } />
					{ translate( 'Include entire country in the zone' ) }
				</div>
			);
		}

		if ( canFilterByState ) {
			radios.push(
				<div key={ 2 } onClick={ onStateSelect }>
					<FormRadio onChange={ onStateSelect } checked={ filteredByState } />
					{ translate( 'Include specific states in the zone' ) }
				</div>
			);
		}

		return radios;
	};

	const renderState = ( state, index ) => {
		const { name, selected, code, disabled } = state;

		const onToggle = event => {
			event.stopPropagation();
			if ( disabled ) {
				return;
			}
			actions.toggleStateSelected( code, ! selected );
		};

		return (
			<li key={ index } className="shipping-zone__location-dialog-list-item" onClick={ onToggle }>
				<FormCheckbox
					onChange={ onToggle }
					className="shipping-zone__location-dialog-list-item-checkbox"
					checked={ selected }
					disabled={ disabled }
				/>
				{ decodeEntities( name ) }
			</li>
		);
	};

	const renderDetailedSettings = () => {
		if ( filteredByPostcode ) {
			const onPostcodeChange = event => actions.editPostcode( event.target.value );

			return (
				<FormFieldSet>
					<FormLabel required>{ translate( 'Post codes' ) }</FormLabel>
					<FormTextInput value={ postcode || '' } onChange={ onPostcodeChange } />
					<p>
						{ translate(
							'Postcodes containing wildcards (e.g. CB23*) ' +
								'and fully numeric ranges (e.g. 90210...99000) are also supported.'
						) }
					</p>
				</FormFieldSet>
			);
		}

		if ( filteredByState ) {
			return (
				<FormFieldSet>
					<FormLabel required>{ translate( 'States' ) }</FormLabel>
					<FilteredList
						items={ states }
						filterBy="name"
						renderItem={ renderState }
						placeholder={ translate( 'Filter by state from the list below' ) }
					/>
				</FormFieldSet>
			);
		}

		return null;
	};

	return (
		<div>
			<FormFieldSet>
				<FormLabel>{ translate( 'Shipping Zone settings' ) }</FormLabel>
				{ renderRadios() }
			</FormFieldSet>
			{ renderDetailedSettings() }
		</div>
	);
};

ShippingZoneLocationDialogSettings.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	state => {
		const locations = getShippingZoneLocationsWithEdits( state );

		return {
			canFilter: canLocationsBeFiltered( state ),
			canFilterByState: canLocationsBeFilteredByState( state ),
			filteredByPostcode: areLocationsFilteredByPostcode( state ),
			filteredByState: areLocationsFilteredByState( state ),
			unfiltered: areLocationsUnfiltered( state ),
			states: getCurrentlyEditingShippingZoneStates( state ),
			postcode: locations && locations.postcode[ 0 ],
			countryOwner: getCurrentSelectedCountryZoneOwner( state ),
		};
	},
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId(
			{
				filterByWholeCountry,
				filterByState,
				filterByPostcode,
				toggleStateSelected,
				editPostcode,
			},
			dispatch,
			ownProps.siteId
		),
	} )
)( localize( ShippingZoneLocationDialogSettings ) );
