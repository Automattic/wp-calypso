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
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
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
	const onWholeCountrySelect = ( event ) => {
		event.stopPropagation();
		actions.filterByWholeCountry();
	};
	const onStateSelect = ( event ) => {
		event.stopPropagation();
		actions.filterByState();
	};
	const onPostcodeSelect = ( event ) => {
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
			<label key={ 1 } htmlFor="include-postcodes">
				<FormRadio
					id="include-postcodes"
					name="include"
					onChange={ onPostcodeSelect }
					checked={ filteredByPostcode }
				/>
				{ translate( 'Include specific postcodes in the zone' ) }
			</label>,
		];

		if ( ! countryOwner ) {
			radios.unshift(
				<label key={ 0 } htmlFor="include-all">
					<FormRadio
						id="include-all"
						name="include"
						onChange={ onWholeCountrySelect }
						checked={ unfiltered }
					/>
					{ translate( 'Include entire country in the zone' ) }
				</label>
			);
		}

		if ( canFilterByState ) {
			radios.push(
				<label key={ 2 } htmlFor="include-states">
					<FormRadio
						id="include-states"
						name="include"
						onChange={ onStateSelect }
						checked={ filteredByState }
					/>
					{ translate( 'Include specific states in the zone' ) }
				</label>
			);
		}

		return radios;
	};

	const renderState = ( state, index ) => {
		const { name, selected, code, disabled } = state;

		const onToggle = ( event ) => {
			event.stopPropagation();
			if ( disabled ) {
				return;
			}
			actions.toggleStateSelected( code, ! selected );
		};

		const inputId = `state-${ index }`;

		return (
			<li key={ index } className="shipping-zone__location-dialog-list-item">
				<label htmlFor={ inputId }>
					<FormCheckbox
						id={ inputId }
						onChange={ onToggle }
						className="shipping-zone__location-dialog-list-item-checkbox"
						checked={ selected }
						disabled={ disabled }
					/>
					{ name }
				</label>
			</li>
		);
	};

	const renderDetailedSettings = () => {
		if ( filteredByPostcode ) {
			const onPostcodeChange = ( event ) => actions.editPostcode( event.target.value );

			return (
				<FormFieldSet>
					<FormLabel htmlFor="postcodes" required>
						{ translate( 'Post codes' ) }
					</FormLabel>
					<FormTextInput id="postcodes" value={ postcode || '' } onChange={ onPostcodeChange } />
					<p>
						{ translate(
							'Postcodes containing wildcards (e.g. CB23*) and fully numeric ranges (e.g. 90210…99000) are also supported.'
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
		<div className="shipping-zone__location-dialog-settings">
			<FormFieldSet>
				<FormLegend>{ translate( 'Shipping zone settings' ) }</FormLegend>
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
	( state ) => {
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
