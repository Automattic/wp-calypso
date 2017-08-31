/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import getPackageDescriptions from './get-package-descriptions';

const PackageList = ( { selected, all, errors, packageId, openPackage } ) => {
	const renderCountOrError = ( isError, count ) => {
		if ( isError ) {
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			return ( <Gridicon icon="notice-outline" className="is-error" size={ 18 } /> );
		}

		if ( undefined === count ) {
			return null;
		}

		return ( <span className="packages-step__list-package-count">{ count }</span> );
	};

	const renderPackageListItem = ( pckgId, name, count ) => {
		const isError = 0 < Object.keys( errors[ pckgId ] || {} ).length;
		const onOpenClick = () => openPackage( pckgId );
		return (
			<div className="packages-step__list-item" key={ pckgId }>
				<div
					className={ classNames( 'packages-step__list-package', { 'is-selected': packageId === pckgId } ) }
					onClick={ onOpenClick } >
					<span className="packages-step__list-package-name">{ name }</span>
					{ renderCountOrError( isError, count ) }
				</div>
			</div>
		);
	};

	const renderPackageListHeader = ( key, text ) => {
		return ( <div className="packages-step__list-item packages-step__list-header" key={ key }>{ text }</div> );
	};

	const packageLabels = getPackageDescriptions( selected, all, false );
	const packed = [];
	const individual = [];

	Object.keys( selected ).forEach( ( pckgId ) => {
		const pckg = selected[ pckgId ];

		if ( 'individual' === pckg.box_id ) {
			individual.push( renderPackageListItem( pckgId, pckg.items[ 0 ].name ) );
		} else {
			packed.push( renderPackageListItem( pckgId, packageLabels[ pckgId ], pckg.items.length ) );
		}
	} );

	if ( packed.length || individual.length ) {
		packed.unshift( renderPackageListHeader( 'boxed-header', __( 'Packages to be Shipped' ) ) );
	}

	return (
		<div className="packages-step__list">
			{ packed }
			{ individual }
		</div>
	);
};

PackageList.propTypes = {
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	packageId: PropTypes.string.isRequired,
	errors: PropTypes.object,
	openPackage: PropTypes.func.isRequired,
};

export default PackageList;
