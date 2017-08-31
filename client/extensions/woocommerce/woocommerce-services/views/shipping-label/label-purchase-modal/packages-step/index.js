/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PackageList from './list';
import PackageInfo from './package-info';
import MoveItemDialog from './move-item';
import AddItemDialog from './add-item';
import StepConfirmationButton from '../step-confirmation-button';
import ErrorNotice from 'components/error-notice';
import { hasNonEmptyLeaves } from 'lib/utils/tree';
import StepContainer from '../step-container';

const PackagesStep = ( props ) => {
	const {
		openedPackageId,
		selected,
		all,
		flatRateGroups,
		storeOptions,
		labelActions,
		errors,
		expanded,
		showItemMoveDialog,
		movedItemIndex,
		targetPackageId,
		showAddItemDialog,
		addedItems,
	} = props;

	const packageIds = Object.keys( selected );
	const itemsCount = packageIds.reduce( ( result, pId ) => ( result + selected[ pId ].items.length ), 0 );
	const totalWeight = packageIds.reduce( ( result, pId ) => ( result + selected[ pId ].weight ), 0 );
	const isValidWeight = packageIds.reduce( ( result, pId ) => ( result && 0 < selected[ pId ].weight ), true );
	const isValidPackageType = packageIds.reduce( ( result, pId ) => ( result && 'not_selected' !== selected[ pId ].box_id ), true );
	const isValidPackages = 0 < packageIds.length;
	const hasAnyPackagesConfigured = all && Object.keys( all ).length;

	const getContainerState = () => {
		if ( ! isValidPackages ) {
			return {
				isError: true,
				summary: __( 'No packages selected' ),
			};
		}

		if ( ! isValidPackageType ) {
			return {
				isError: true,
				summary: __( 'Please select a package type' ),
			};
		}

		if ( ! isValidWeight ) {
			return {
				isError: true,
				summary: __( 'Weight not entered' ),
			};
		}

		let summary = '';

		if ( 1 === packageIds.length && 1 === itemsCount ) {
			summary = __( '1 item in 1 package: %(weight)f %(unit)s total', {
				args: {
					weight: totalWeight,
					unit: storeOptions.weight_unit,
				},
			} );
		} else if ( 1 === packageIds.length ) {
			summary = __( '%(itemsCount)d items in 1 package: %(weight)f %(unit)s total', {
				args: {
					itemsCount,
					weight: totalWeight,
					unit: storeOptions.weight_unit,
				},
			} );
		} else {
			summary = __( '%(itemsCount)d items in %(packageCount)d packages: %(weight)f %(unit)s total', {
				args: {
					itemsCount,
					packageCount: packageIds.length,
					weight: totalWeight,
					unit: storeOptions.weight_unit,
				},
			} );
		}

		if ( ! hasAnyPackagesConfigured ) {
			return { isWarning: true, summary };
		}

		return { isSuccess: true, summary };
	};

	const renderWarning = () => {
		if ( ! hasAnyPackagesConfigured ) {
			return <ErrorNotice isWarning>
				<span>{ __(
					'There are no packages configured. The items have been packed individually. ' +
					'You can add or enable packages using the {{a}}Packaging Manager{{/a}}.',
					{ components: { a: <a href="admin.php?page=wc-settings&tab=shipping&section=package-settings" /> } }
				) }</span>
			</ErrorNotice>;
		}

		return null;
	};

	const renderContents = () => {
		return (
			<div className="packages-step">
				<PackageList
					key="packages-list"
					openPackage={ labelActions.openPackage }
					packageId={ openedPackageId }
					selected={ selected }
					all={ all }
					errors={ errors }
					addPackage={ labelActions.addPackage } />

				{ packageIds.length
					? ( <PackageInfo
							key="package-info"
							packageId={ openedPackageId }
							selected={ selected }
							all={ all }
							flatRateGroups={ flatRateGroups }
							dimensionUnit={ storeOptions.dimension_unit }
							weightUnit={ storeOptions.weight_unit }
							errors={ errors }
							updateWeight={ labelActions.updatePackageWeight }
							openItemMove={ labelActions.openItemMove }
							removeItem={ labelActions.removeItem }
							removePackage={ labelActions.removePackage }
							setPackageType={ labelActions.setPackageType }
							openAddItem={ labelActions.openAddItem } /> )

					: ( <div key="no-packages" className="packages-step__package">
							{ __( 'There are no packages or items associated with this order' ) }
						</div> )
				}
			</div>
		);
	};

	const toggleStep = () => labelActions.toggleStep( 'packages' );
	return (
		<StepContainer
			title={ __( 'Packages' ) }
			{ ...getContainerState() }
			expanded={ expanded }
			toggleStep={ toggleStep } >
			{ renderWarning() }
			{ renderContents() }
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) || ! packageIds.length }
				onClick={ labelActions.confirmPackages } >
					{ __( 'Use these packages' ) }
			</StepConfirmationButton>
			<MoveItemDialog
				showItemMoveDialog={ showItemMoveDialog || false }
				movedItemIndex={ isNaN( movedItemIndex ) ? -1 : movedItemIndex }
				openedPackageId={ openedPackageId }
				targetPackageId={ targetPackageId }
				selected={ selected }
				all={ all }
				closeItemMove={ labelActions.closeItemMove }
				setTargetPackage={ labelActions.setTargetPackage }
				moveItem={ labelActions.moveItem } />
			<AddItemDialog
				showAddItemDialog={ showAddItemDialog || false }
				addedItems={ addedItems }
				openedPackageId={ openedPackageId }
				selected={ selected }
				all={ all }
				closeAddItem={ labelActions.closeAddItem }
				setAddedItem={ labelActions.setAddedItem }
				addItems={ labelActions.addItems } />
		</StepContainer>
	);
};

PackagesStep.propTypes = {
	openedPackageId: PropTypes.string,
	showItemMoveDialog: PropTypes.bool,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	flatRateGroups: PropTypes.object.isRequired,
	labelActions: PropTypes.object.isRequired,
	storeOptions: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	expanded: PropTypes.bool,
	movedItemIndex: PropTypes.number,
	targetPackageId: PropTypes.string,
	showAddItemDialog: PropTypes.bool,
	sourcePackageId: PropTypes.string,
};

export default PackagesStep;
