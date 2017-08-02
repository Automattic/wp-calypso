/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { concat, difference, flatten, map, omit, trim } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import checkInputs from './modal-errors';
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormDimensionsInput from 'woocommerce/components/form-dimensions-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormButton from 'components/forms/form-button';
import FieldError from '../../components/field-error';
import inputFilters from './input-filters';

const getDialogButtons = ( mode, dismissModal, savePackage, onRemove, translate ) => {
	const buttons = [
		<FormButton onClick={ savePackage }>
			{ ( 'add' === mode ) ? translate( 'Add package' ) : translate( 'Apply changes' ) }
		</FormButton>,
		<FormButton onClick={ dismissModal } isPrimary={ false }>
			{ translate( 'Cancel' ) }
		</FormButton>,
	];

	if ( 'add' !== mode ) {
		buttons.unshift( {
			action: 'delete',
			label: <span>{ translate( '{{icon/}} Delete this package', { components: {
				icon: <Gridicon icon="trash" />,
			} } ) }</span>,
			onClick: onRemove,
			additionalClassNames: 'packages__delete is-scary is-borderless'
		} );
	}

	return buttons;
};

const renderDimensionsInput = ( dimensionsName, dimensionsStr, updateField ) => {
	const { length, width, height } = inputFilters.parseDimensions( dimensionsStr );
	const onChange = ( event ) => {
		const name = event.target.name;
		const value = event.target.value;
		const allDimensions = [
			'length' === name ? value : length,
			'width' === name ? value : width,
			'height' === name ? value : height,
		];
		updateField( dimensionsName, allDimensions.join( ' x ' ) );
	};

	return (
		<FormDimensionsInput
			dimensions={ { width, height, length } }
			onChange={ onChange } />
	);
};

const OuterDimensionsToggle = ( { siteId, toggleOuterDimensions, translate } ) => {
	const onClick = ( event ) => {
		event.preventDefault();
		toggleOuterDimensions( siteId );
	};

	return (
		<a href="#" className="packages__setting-explanation" onClick={ onClick }>
			{ translate( 'Add exterior dimensions' ) }
		</a>
	);
};

const AddPackageDialog = ( props ) => {
	const {
		siteId,
		form,
		dismissModal,
		toggleOuterDimensions,
		setModalErrors,
		savePackage,
		updatePackagesField,
		removePackage,
		translate,
	} = props;

	const {
		showModal,
		mode,
		modalErrors,
		dimensionUnit,
		weightUnit,
		packages,
		packageSchema,
		predefinedSchema,
		packageData,
		showOuterDimensions,
	} = form;

	const customPackages = packages.custom;

	const {
		index,
		name,
		inner_dimensions,
		outer_dimensions,
		box_weight,
		max_weight,
		is_letter,
	} = packageData;

	const isOuterDimensionsVisible = showOuterDimensions || outer_dimensions;

	const onSave = () => {
		const editName = 'number' === typeof packageData.index ? customPackages[ packageData.index ].name : null;

		//get reserved box names:
		const boxNames = concat(
			difference( customPackages.map( ( boxPackage ) => boxPackage.name ), [ editName ] ), //existing custom boxes
			flatten( map( predefinedSchema, predef => map( predef, group => group.definitions ) ) ), //predefined boxes
			[ 'individual' ] //reserved for items shipping in original packaging
		);

		const filteredPackageData = Object.assign( {}, packageData, {
			name: inputFilters.string( packageData.name ),
			inner_dimensions: inputFilters.dimensions( packageData.inner_dimensions ),
			outer_dimensions: inputFilters.dimensions( packageData.outer_dimensions ),
			box_weight: inputFilters.number( packageData.box_weight ),
			max_weight: inputFilters.number( packageData.max_weight ),
		} );

		const errors = checkInputs( filteredPackageData, boxNames, packageSchema );
		if ( errors.any ) {
			updatePackagesField( siteId, filteredPackageData );
			setModalErrors( siteId, errors );
			return;
		}

		savePackage( siteId, filteredPackageData );
	};

	const updateField = ( key, value ) => {
		setModalErrors( siteId, omit( modalErrors, key ) );
		updatePackagesField( siteId, { [ key ]: value } );
	};

	const updateTextField = ( event ) => {
		const key = event.target.name;
		const value = event.target.value;
		updateField( key, value );
	};

	const fieldInfo = ( field, nonEmptyText ) => {
		const altText = nonEmptyText || translate( 'Invalid value.' );
		const text = '' === trim( packageData[ field ] ) ? translate( 'This field is required.' ) : altText;
		return modalErrors[ field ] ? <FieldError text={ text } /> : null;
	};

	const onClose = () => ( dismissModal( siteId ) );
	const onRemove = () => removePackage( siteId, index );

	const onPackageTypeSelect = ( event ) => {
		updatePackagesField( siteId, { is_letter: 'envelope' === event.target.value } );
	};
	const renderTypeSelection = () => {
		return (
			<FormFieldset>
				<FormLabel htmlFor="package_type">{ translate( 'Type of package' ) }</FormLabel>
				<FormSelect id="package_type" onChange={ onPackageTypeSelect } value={ is_letter ? 'envelope' : 'box' }>
					<option value="box">{ translate( 'Box' ) }</option>
					<option value="envelope">{ translate( 'Envelope' ) }</option>
				</FormSelect>
			</FormFieldset>
		);
	};

	return (
		<Dialog
			isVisible={ showModal }
			additionalClassNames="packages__add-edit-dialog woocommerce"
			onClose={ onClose }
			buttons={ getDialogButtons( mode, onClose, onSave, onRemove, translate ) }>
			<FormSectionHeading>
				{ ( 'edit' === mode ) ? translate( 'Edit package' ) : translate( 'Add a package' ) }
			</FormSectionHeading>
			{ ( 'add' === mode ) ? renderTypeSelection() : null }
			<FormFieldset>
				<FormLabel htmlFor="name">{ translate( 'Package name' ) }</FormLabel>
				<FormTextInput
					id="name"
					name="name"
					placeholder={ translate( 'The customer will see this during checkout' ) }
					value={ name || '' }
					onChange={ updateTextField }
					isError={ modalErrors.name }
				/>
				{ fieldInfo( 'name', translate( 'This field must be unique' ) ) }
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ translate( 'Inner Dimensions (L x W x H) %(dimensionUnit)s', { args: { dimensionUnit } } ) }</FormLabel>
				{ renderDimensionsInput(
					'inner_dimensions',
					inner_dimensions,
					updateField ) }
				{ fieldInfo( 'inner_dimensions' ) }
				{ ! isOuterDimensionsVisible ? <OuterDimensionsToggle { ...{ siteId, toggleOuterDimensions, translate } } /> : null }
			</FormFieldset>
			{ isOuterDimensionsVisible
				? ( <FormFieldset>
						<FormLabel>
							{ translate( 'Outer Dimensions (L x W x H) %(dimensionUnit)s', { args: { dimensionUnit } } ) }
						</FormLabel>
						{ renderDimensionsInput(
							'outer_dimensions',
							outer_dimensions,
							updateField ) }
						{ fieldInfo( 'outer_dimensions' ) }
					</FormFieldset> )
				: null
			}
			<FormFieldset className="packages__add-package-weight-group">
				<div className="packages__add-package-weight">
					<FormLabel htmlFor="box_weight">{ translate( 'Package weight' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="box_weight"
						name="box_weight"
						placeholder={ translate( 'Package weight' ) }
						value={ box_weight || '' }
						onChange={ updateTextField }
						isError={ modalErrors.box_weight }
						type="number"
						noWrap
						suffix={ weightUnit }
					/>
					{ fieldInfo( 'box_weight' ) }
				</div>
				<div className="packages__add-package-weight">
					<FormLabel htmlFor="max_weight">{ translate( 'Max weight' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="max_weight"
						name="max_weight"
						placeholder={ translate( 'Max weight' ) }
						value={ max_weight || '' }
						onChange={ updateTextField }
						isError={ modalErrors.max_weight }
						type="number"
						noWrap
						suffix={ weightUnit }
					/>
					{ fieldInfo( 'max_weight' ) }
				</div>
				<FormSettingExplanation>
					{ translate( 'Defines both the weight of the empty package and the max weight it can hold' ) }
				</FormSettingExplanation>
			</FormFieldset>
		</Dialog>
	);
};

AddPackageDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	dismissModal: PropTypes.func.isRequired,
	form: PropTypes.object.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	showOuterDimensions: PropTypes.bool,
	toggleOuterDimensions: PropTypes.func.isRequired,
	savePackage: PropTypes.func.isRequired,
	packageData: PropTypes.shape( {
		index: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		inner_dimensions: PropTypes.string.isRequired,
		outer_dimensions: PropTypes.string.isRequired,
		box_weight: PropTypes.number.isRequired,
		max_weight: PropTypes.number.isRequired,
		is_user_defined: PropTypes.bool.isRequired,
		is_letter: PropTypes.bool.isRequired,
	} ),
	setModalErrors: PropTypes.func.isRequired,
	removePackage: PropTypes.func.isRequired,
};

export default localize( AddPackageDialog );
