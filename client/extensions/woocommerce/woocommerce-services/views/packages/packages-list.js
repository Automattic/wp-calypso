/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import PackagesListItem from './packages-list-item';

const PackagesList = ( {
		siteId,
		isFetching,
		packages,
		dimensionUnit,
		editable,
		selected,
		serviceId,
		editPackage,
		togglePackage,
		translate
	} ) => {
	if ( isFetching ) {
		packages = [ {}, {}, {} ];
	}

	const renderPackageListItem = ( pckg, idx ) => {
		const isSelected = selected && includes( selected, pckg.id );
		const onToggle = () => togglePackage( siteId, serviceId, pckg.id );

		return (
			<PackagesListItem
				key={ idx }
				index={ idx }
				isPlaceholder={ isFetching }
				data={ pckg }
				selected={ isSelected }
				{ ...{
					siteId,
					onToggle,
					editable,
					dimensionUnit,
					editPackage,
				} }
			/>
		);
	};

	const renderList = () => {
		return packages.map( ( pckg, idx ) => renderPackageListItem( pckg, idx ) );
	};

	const renderHeader = () => {
		if ( ! packages || ! packages.length ) {
			return null;
		}

		return (
			<div className="packages__packages-row packages__packages-header">
				<div className="packages__packages-row-icon"></div>
				<div className="packages__packages-row-details">{ translate( 'Name' ) }</div>
				<div className="packages__packages-row-dimensions">{ translate( 'Dimensions' ) }</div>
				<div className="packages__packages-row-actions" />
			</div>
		);
	};

	return (
		<div>
			{ editable && renderHeader() }
			{ renderList() }
		</div>
	);
};

PackagesList.propTypes = {
	siteId: PropTypes.number,
	packages: PropTypes.array,
	dimensionUnit: PropTypes.string,
	editable: PropTypes.bool.isRequired,
	isFetching: PropTypes.bool,
	selected: PropTypes.array,
	serviceId: PropTypes.string,
	groupId: PropTypes.string,
	toggleAll: PropTypes.func,
	togglePackage: PropTypes.func,
	editPackage: PropTypes.func,
};

export default localize( PackagesList );
