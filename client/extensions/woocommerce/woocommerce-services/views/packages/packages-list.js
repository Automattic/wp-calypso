/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';
import PackagesListItem from './packages-list-item';
import Spinner from 'components/spinner';

const noPackages = () => {
	return (
		<div className="packages-list-empty">
			<div className="package-list-empty-icon">
				<Gridicon icon="info" size={ 18 } />
			</div>
			<div className="packages-list-empty-description">{ __( 'Your packages will display here once they are added.' ) }</div>
		</div>
	);
};

const PackagesList = ( { packages, dimensionUnit, editable, selected, serviceId, removePackage, editPackage, togglePackage } ) => {
	const renderPackageListItem = ( pckg, idx ) => {
		const isSelected = selected && selected.includes( pckg.id );
		const onToggle = () => togglePackage( serviceId, pckg.id );
		const onRemove = () => removePackage( idx );

		return (
			<PackagesListItem
				key={ idx }
				index={ idx }
				data={ pckg }
				selected={ isSelected }
				{ ...{
					onToggle,
					onRemove,
					editable,
					dimensionUnit,
					editPackage,
				} }
			/>
		);
	};

	const renderList = () => {
		if ( ! packages ) {
			return (
				<div className="loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}
		if ( ! packages.length ) {
			return noPackages();
		}
		return packages.map( ( pckg, idx ) => renderPackageListItem( pckg, idx ) );
	};

	return (
		<FormFieldset className="wcc-shipping-packages-list">
			<div className="wcc-shipping-packages-list-header">
				<FormLegend className="package-actions" />
				<FormLegend className="package-type">{ __( 'Type' ) }</FormLegend>
				<FormLegend className="package-name">{ __( 'Name' ) }</FormLegend>
				<FormLegend className="package-dimensions">{ __( 'Dimensions (L x W x H)' ) }</FormLegend>
			</div>
			{ renderList() }
		</FormFieldset>
	);
};

PackagesList.propTypes = {
	packages: PropTypes.array.isRequired,
	dimensionUnit: PropTypes.string.isRequired,
	editable: PropTypes.bool.isRequired,
	selected: PropTypes.array,
	serviceId: PropTypes.string,
	groupId: PropTypes.string,
	toggleAll: PropTypes.func,
	togglePackage: PropTypes.func,
	removePackage: PropTypes.func,
	editPackage: PropTypes.func,
};

export default PackagesList;
