/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SelectOptGroups from 'components/forms/select-opt-groups';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';

const defaultPackages = {
	label: 'Custom box',
	options: [
		{
			value: 'default_box',
			label: 'Box',
			is_user_defined: true,
		},
		{
			value: 'default_envelope',
			label: 'Envelope',
			is_user_defined: true,
		},
	],
};

const getOptionGroups = ( presets ) => {
	const groups = [ defaultPackages ];
	if ( presets ) {
		groups.push( {
			label: presets.title,
			options: presets.boxes.map( ( box, idx ) => {
				return {
					value: 'preset_' + idx,
					label: box.name,
				};
			} ),
		} );
	}

	return groups;
};

const handleSelectEvent = ( e, selectDefault, selectPreset, setSelectedPreset ) => {
	const parts = e.target.value.split( '_' );
	const type = parts[ 0 ];
	const id = parts[ 1 ];
	setSelectedPreset( e.target.value );
	switch ( type ) {
		case 'default':
			return selectDefault( id );
		case 'preset':
			return selectPreset( Number.parseInt( id ) );
	}
};

const AddPackagePresets = ( { selectedPreset, setSelectedPreset, presets, setModalErrors, updatePackagesField } ) => {
	const onSelectPreset = ( idx ) => {
		const preset = presets.boxes[ idx ];
		setModalErrors( {} );
		updatePackagesField( {
			index: null,
			is_user_defined: false,
			...preset,
		} );
	};

	const onSelectDefault = ( value ) => {
		setModalErrors( {} );
		updatePackagesField( {
			index: null,
			is_letter: 'envelope' === value,
			name: null,
			is_user_defined: true,
			outer_dimensions: null,
			inner_dimensions: null,
			box_weight: null,
			max_weight: null,
		} );
	};

	const onChange = ( event ) => handleSelectEvent( event, onSelectDefault, onSelectPreset, setSelectedPreset );

	return (
		<FormFieldset>
			<FormLabel htmlFor="package_type">{ __( 'Type of package' ) }</FormLabel>
			<SelectOptGroups
				id="package_type"
				defaultValue={ selectedPreset }
				onChange={ onChange }
				optGroups={ getOptionGroups( presets ) }
				readOnly={ false } />
		</FormFieldset>
	);
};

AddPackagePresets.propTypes = {
	selectedPreset: PropTypes.string,
	setSelectedPreset: PropTypes.func.isRequired,
	presets: PropTypes.object,
	setModalErrors: PropTypes.func.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
};

export default AddPackagePresets;
