/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';
import Gridicon from 'gridicons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import getPackageDescriptions from './get-package-descriptions';
import getFormErrors from '../../../state/selectors/errors';
import { openPackage } from '../../../state/actions';

const PackageList = ( props ) => {
	const { selected, all, errors, packageId } = props;

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
		const onOpenClick = () => props.openPackage( pckgId );
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

const mapStateToProps = ( state ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};
	const errors = loaded && getFormErrors( state, storeOptions ).packages;
	return {
		errors,
		packageId: state.shippingLabel.openedPackageId,
		selected: state.shippingLabel.form.packages.selected,
		all: state.shippingLabel.form.packages.all,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { openPackage }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( PackageList );
