/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { concat, difference, flatten, map } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import EditPackage from './edit-package';
import checkInputs from './modal-errors';
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';
import inputFilters from './input-filters';
import PredefinedPackages from './predefined-packages';
import SegmentedControl from 'components/segmented-control';

const getDialogButtons = ( mode, dismissModal, savePackage, onRemove, translate ) => {
	const buttons = [
		<FormButton onClick={ savePackage }>
			{ ( 'add-custom' === mode ) ? translate( 'Add package' ) : translate( 'Apply changes' ) }
		</FormButton>,
		<FormButton onClick={ dismissModal } isPrimary={ false }>
			{ translate( 'Cancel' ) }
		</FormButton>,
	];

	if ( 'edit' === mode ) {
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

const AddPackageDialog = ( props ) => {
	const {
		siteId,
		form,
		setModalErrors,
		savePackage,
		savePredefinedPackages,
		dismissModal,
		removePackage,
		setAddMode,
		updatePackagesField,
		translate,
	} = props;

	const {
		showModal,
		mode,
		packages,
		packageSchema,
		predefinedSchema,
		packageData,
	} = form;

	const {
		index,
	} = packageData;

	const customPackages = packages.custom;

	const onSave = () => {
		if ( 'add-predefined' === mode ) {
			savePredefinedPackages( siteId );
			return;
		}

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

	const onClose = () => ( dismissModal( siteId ) );
	const onRemove = () => removePackage( siteId, index );

	const switchMode = ( option ) => {
		setAddMode( siteId, option.value );
	};

	const heading = 'edit' === mode ? translate( 'Edit package' ) : translate( 'Add a package' );
	const showSegmentedControl = 'add-custom' === mode || 'add-predefined' === mode;
	const showEdit = 'add-custom' === mode || 'edit' === mode;
	const showPredefined = 'add-predefined' === mode;

	return (
		<Dialog
			isVisible={ showModal }
			additionalClassNames="packages__add-edit-dialog woocommerce"
			onClose={ onClose }
			buttons={ getDialogButtons( mode, onClose, onSave, onRemove, translate ) }>
			<FormSectionHeading>{ heading }</FormSectionHeading>
			{ showSegmentedControl && <SegmentedControl
				className="packages__mode-select"
				initialSelected={ mode }
				onSelect={ switchMode }
				options={ [
					{ value: 'add-custom', label: 'Custom package' },
					{ value: 'add-predefined', label: 'Service package' },
				] } /> }
			{ showEdit && <EditPackage { ...props } /> }
			{ showPredefined && <PredefinedPackages { ...props } /> }
		</Dialog>
	);
};

AddPackageDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	dismissModal: PropTypes.func.isRequired,
	form: PropTypes.object.isRequired,
	updatePackagesField: PropTypes.func.isRequired,
	savePackage: PropTypes.func.isRequired,
	packageData: PropTypes.shape( {
		index: PropTypes.number.isRequired,
	} ),
	setModalErrors: PropTypes.func.isRequired,
	removePackage: PropTypes.func.isRequired,
	setAddMode: PropTypes.func.isRequired,
};

export default localize( AddPackageDialog );
