/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { concat, difference, flatten, map } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import EditPackage from './edit-package';
import checkInputs from './modal-errors';
import { Dialog } from '@automattic/components';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormButton from 'components/forms/form-button';
import inputFilters from './input-filters';
import PredefinedPackages from './predefined-packages';
import SimplifiedSegmentedControl from 'components/segmented-control/simplified';
import { getPredefinedPackagesChangesSummary } from '../../state/packages/selectors';

const AddPackageDialog = ( props ) => {
	const {
		siteId,
		form,
		predefinedPackagesSummary,
		setModalErrors,
		savePackage,
		savePredefinedPackages,
		dismissModal,
		removePackage,
		setAddMode,
		updatePackagesField,
		translate,
	} = props;

	const { showModal, mode, packages, packageSchema, predefinedSchema, packageData } = form;

	const { index } = packageData;

	const customPackages = packages.custom;
	const isEditing = 'edit' === mode;
	const isAddingCustom = 'add-custom' === mode;
	const isAddingPredefined = 'add-predefined' === mode;

	const onSave = () => {
		if ( isAddingPredefined ) {
			savePredefinedPackages( siteId );
			return;
		}

		const editName =
			'number' === typeof packageData.index ? customPackages[ packageData.index ].name : null;

		//get reserved box names:
		const boxNames = concat(
			difference(
				customPackages.map( ( boxPackage ) => boxPackage.name ),
				[ editName ]
			), //existing custom boxes
			flatten(
				map( predefinedSchema, ( predef ) => map( predef, ( group ) => group.definitions ) )
			), //predefined boxes
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

	const onClose = () => dismissModal( siteId );
	const onRemove = () => removePackage( siteId, index );

	const switchMode = ( option ) => {
		setAddMode( siteId, option.value );
	};

	const heading = isEditing ? translate( 'Edit package' ) : translate( 'Add a package' );
	const showSegmentedControl = isAddingCustom || isAddingPredefined;
	const showEdit = isAddingCustom || isEditing;
	const showPredefined = isAddingPredefined;
	let doneButtonLabel;
	if ( isAddingCustom || ( isAddingPredefined && 0 === predefinedPackagesSummary.removed ) ) {
		doneButtonLabel = translate( 'Add package', 'Add packages', {
			count: isAddingCustom ? 1 : predefinedPackagesSummary.added,
		} );
	} else {
		doneButtonLabel = translate( 'Done' );
	}

	const buttons = [
		<FormButton onClick={ onSave }>{ doneButtonLabel }</FormButton>,
		<FormButton onClick={ onClose } isPrimary={ false }>
			{ translate( 'Cancel' ) }
		</FormButton>,
	];

	if ( isEditing ) {
		buttons.unshift( {
			action: 'delete',
			label: (
				<span>
					{ translate( '{{icon/}} Delete this package', {
						components: {
							icon: <Gridicon icon="trash" />,
						},
					} ) }
				</span>
			),
			onClick: onRemove,
			additionalClassNames: 'packages__delete is-scary is-borderless',
		} );
	}

	return (
		<Dialog
			isVisible={ showModal }
			additionalClassNames="packages__add-edit-dialog woocommerce wcc-root"
			onClose={ onClose }
			buttons={ buttons }
		>
			<FormSectionHeading>{ heading }</FormSectionHeading>
			{ showSegmentedControl && (
				<SimplifiedSegmentedControl
					primary
					className="packages__mode-select"
					initialSelected={ mode }
					onSelect={ switchMode }
					options={ [
						{ value: 'add-custom', label: 'Custom package' },
						{ value: 'add-predefined', label: 'Service package' },
					] }
				/>
			) }
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

export default connect( ( state ) => ( {
	predefinedPackagesSummary: getPredefinedPackagesChangesSummary( state ),
} ) )( localize( AddPackageDialog ) );
