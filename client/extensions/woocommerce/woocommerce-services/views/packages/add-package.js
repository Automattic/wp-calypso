/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import _ from 'lodash';

/**
 * Internal dependencies
 */
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormButton from 'components/forms/form-button';
import Modal from 'components/modal';
import AddPackagePresets from './add-package-presets';
import checkInputs from './modal-errors';
import inputFilters from './input-filters';
import FieldError from 'components/field-error';
import FieldDescription from 'components/field-description';

const getDialogButtons = ( mode, dismissModal, savePackage ) => {
	return [
		<FormButton onClick={ savePackage }>
			{ ( 'add' === mode ) ? __( 'Add package' ) : __( 'Apply changes' ) }
		</FormButton>,
		<FormButton onClick={ dismissModal } isPrimary={ false }>
			{ __( 'Cancel' ) }
		</FormButton>,
	];
};

const OuterDimensionsToggle = ( { toggleOuterDimensions } ) => {
	const onClick = ( evt ) => {
		evt.preventDefault();
		toggleOuterDimensions();
	};

	return (
		<a href="#" className="form-setting-explanation" onClick={ onClick }>
			{ __( 'View exterior dimensions' ) }
		</a>
	);
};

const AddPackageDialog = ( props ) => {
	const {
		form,
		dismissModal,
		toggleOuterDimensions,
		setModalErrors,
		savePackage,
		updatePackagesField,
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
		name,
		inner_dimensions,
		outer_dimensions,
		box_weight,
		max_weight,
		is_user_defined,
	} = packageData;

	const fieldClassName = is_user_defined ? null : 'flat-rate-package__inner-dimensions__read-only';
	const isOuterDimensionsVisible = showOuterDimensions || outer_dimensions;
	const exampleDimensions = [ 100.25, 25, 5.75 ].map( ( val ) => val.toLocaleString() ).join( ' x ' );

	const onSave = () => {
		const editName = 'number' === typeof packageData.index ? customPackages[ packageData.index ].name : null;

		//get reserved box names:
		const boxNames = _.concat(
			_.difference( customPackages.map( ( boxPackage ) => boxPackage.name ), [ editName ] ), //existing custom boxes
			_.flatten( _.map( predefinedSchema, predef => _.map( predef, group => group.definitions ) ) ), //predefined boxes
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
			updatePackagesField( filteredPackageData );
			setModalErrors( errors );
			return;
		}

		savePackage( filteredPackageData );
	};

	const updateTextField = ( event ) => {
		const key = event.target.name;
		const value = event.target.value;
		setModalErrors( _.omit( modalErrors, key ) );
		updatePackagesField( { [ key ]: value } );
	};

	const fieldInfo = ( field, nonEmptyText ) => {
		const altText = nonEmptyText || __( 'Invalid value' );
		const text = '' === _.trim( packageData[ field ] ) ? __( 'This field is required' ) : altText;
		return modalErrors[ field ] ? <FieldError text={ text } /> : null;
	};

	return (
		<Modal
			isVisible={ showModal }
			additionalClassNames="wcc-shipping-add-edit-package-dialog"
			onClose={ dismissModal }
			buttons={ getDialogButtons( mode, dismissModal, onSave ) }>
			<FormSectionHeading>
				{ ( 'edit' === mode ) ? __( 'Edit package' ) : __( 'Add a package' ) }
			</FormSectionHeading>
			{ ( 'add' === mode ) ? <AddPackagePresets { ...props } /> : null }
			<FormFieldset>
				<FormLabel htmlFor="name">{ __( 'Package name' ) }</FormLabel>
				<FormTextInput
					id="name"
					name="name"
					placeholder={ __( 'The customer will see this during checkout' ) }
					value={ name || '' }
					onChange={ updateTextField }
					isError={ modalErrors.name }
				/>
				{ fieldInfo( 'name', __( 'This field must be unique' ) ) }
			</FormFieldset>
			<FormFieldset>
				<FormLabel>{ __( 'Inner Dimensions (L x W x H) %(dimensionUnit)s', { args: { dimensionUnit } } ) }</FormLabel>
				<FormTextInput
					name="inner_dimensions"
					placeholder={ exampleDimensions }
					value={ inner_dimensions || '' }
					className={ fieldClassName }
					onChange={ updateTextField }
					disabled={ ! is_user_defined }
					isError={ modalErrors.inner_dimensions }
				/>
				{ fieldInfo( 'inner_dimensions' ) }
				{ ! isOuterDimensionsVisible ? <OuterDimensionsToggle { ...{ toggleOuterDimensions } } /> : null }
			</FormFieldset>
			{ isOuterDimensionsVisible
				? ( <FormFieldset>
						<FormLabel>{ __( 'Outer Dimensions (L x W x H) %(dimensionUnit)s', { args: { dimensionUnit } } ) }</FormLabel>
						<FormTextInput
							name="outer_dimensions"
							placeholder={ exampleDimensions }
							value={ outer_dimensions || '' }
							className={ fieldClassName }
							onChange={ updateTextField }
							disabled={ ! is_user_defined }
							isError={ modalErrors.outer_dimensions }
						/>
						{ fieldInfo( 'outer_dimensions' ) }
					</FormFieldset> )
				: null
			}
			<FormFieldset className="wcc-shipping-add-package-weight-group">
				<div className="wcc-shipping-add-package-weight">
					<FormLabel htmlFor="box_weight">{ __( 'Package weight' ) }</FormLabel>
					<FormTextInput
						id="box_weight"
						name="box_weight"
						placeholder={ __( 'Weight of box' ) }
						value={ box_weight || '' }
						className={ fieldClassName }
						onChange={ updateTextField }
						disabled={ ! is_user_defined }
						isError={ modalErrors.box_weight }
					/>
					{ fieldInfo( 'box_weight' ) }
				</div>
				<div className="wcc-shipping-add-package-weight">
					<FormLabel htmlFor="max_weight">{ __( 'Max weight' ) }</FormLabel>
					<FormTextInput
						id="max_weight"
						name="max_weight"
						placeholder={ __( 'Max weight' ) }
						value={ max_weight || '' }
						className={ fieldClassName }
						onChange={ updateTextField }
						disabled={ ! is_user_defined }
						isError={ modalErrors.max_weight }
					/>
					<span className="wcc-shipping-add-package-weight-unit">{ weightUnit }</span>
					{ fieldInfo( 'max_weight' ) }
				</div>
				<FieldDescription text={ __( 'Defines both the weight of the empty box and the max weight it can hold' ) } />
			</FormFieldset>
		</Modal>
	);
};

AddPackageDialog.propTypes = {
	dismissModal: PropTypes.func.isRequired,
	form: PropTypes.object.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	showOuterDimensions: PropTypes.bool,
	toggleOuterDimensions: PropTypes.func.isRequired,
	savePackage: PropTypes.func.isRequired,
	packageData: PropTypes.object,
	setModalErrors: PropTypes.func.isRequired,
};

export default AddPackageDialog;
