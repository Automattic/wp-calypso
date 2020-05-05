/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import getPackageDescriptions from './get-package-descriptions';
import { openPackage } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';

const PackageList = ( props ) => {
	const { orderId, siteId, selected, all, errors, packageId, translate } = props;

	const renderCountOrError = ( isError, count ) => {
		if ( isError ) {
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			return <Gridicon icon="notice-outline" className="is-error" size={ 18 } />;
		}

		if ( undefined === count ) {
			return null;
		}

		return <span className="packages-step__list-package-count">{ count }</span>;
	};

	const renderPackageListItem = ( pckgId, name, count ) => {
		const isError = 0 < Object.keys( errors[ pckgId ] || {} ).length;
		const onOpenClick = () => props.openPackage( orderId, siteId, pckgId );
		return (
			<div className="packages-step__list-item" key={ pckgId }>
				<Button
					borderless
					className={ classNames( 'packages-step__list-package', {
						'is-selected': packageId === pckgId,
					} ) }
					onClick={ onOpenClick }
				>
					<span className="packages-step__list-package-name">{ name }</span>
					{ renderCountOrError( isError, count ) }
				</Button>
			</div>
		);
	};

	const renderPackageListHeader = ( key, text ) => {
		return (
			<div className="packages-step__list-item packages-step__list-header" key={ key }>
				{ text }
			</div>
		);
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
		packed.unshift(
			renderPackageListHeader( 'boxed-header', translate( 'Packages to be Shipped' ) )
		);
	}

	return (
		<div className="packages-step__list">
			{ packed }
			{ individual }
		</div>
	);
};

PackageList.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	packageId: PropTypes.string.isRequired,
	errors: PropTypes.object,
	openPackage: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const errors = loaded && getFormErrors( state, orderId, siteId ).packages;
	return {
		errors,
		packageId: shippingLabel.openedPackageId,
		selected: shippingLabel.form.packages.selected,
		all: getAllPackageDefinitions( state, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { openPackage }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PackageList ) );
