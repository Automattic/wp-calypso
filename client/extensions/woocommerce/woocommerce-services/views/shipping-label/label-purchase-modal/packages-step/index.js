/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { find, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import PackageList from './list';
import PackageInfo from './package-info';
import MoveItemDialog from './move-item';
import AddItemDialog from './add-item';
import StepConfirmationButton from '../step-confirmation-button';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import StepContainer from '../step-container';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import {
	toggleStep,
	confirmPackages,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const PackagesStep = ( props ) => {
	const { siteId, orderId, selected, weightUnit, errors, expanded, translate } = props;

	const packageIds = Object.keys( selected );
	const itemsCount = packageIds.reduce(
		( result, pId ) => result + selected[ pId ].items.length,
		0
	);
	const totalWeight = packageIds.reduce( ( result, pId ) => result + selected[ pId ].weight, 0 );
	const isValidPackages = 0 < packageIds.length;

	const getContainerState = () => {
		if ( ! isValidPackages ) {
			return {
				isError: true,
				summary: translate( 'No packages selected' ),
			};
		}

		const errorPackage = find( errors, ( pckg ) => ! isEmpty( pckg ) );
		if ( errorPackage ) {
			return {
				isError: true,
				summary: errorPackage[ Object.keys( errorPackage )[ 0 ] ],
			};
		}

		let summary = '';

		if ( 1 === packageIds.length && 1 === itemsCount ) {
			summary = translate( '1 item in 1 package: %(weight)f %(unit)s total', {
				args: {
					weight: totalWeight,
					unit: weightUnit,
				},
			} );
		} else if ( 1 === packageIds.length ) {
			summary = translate( '%(itemsCount)d items in 1 package: %(weight)f %(unit)s total', {
				args: {
					itemsCount,
					weight: totalWeight,
					unit: weightUnit,
				},
			} );
		} else {
			summary = translate(
				'%(itemsCount)d items in %(packageCount)d packages: %(weight)f %(unit)s total',
				{
					args: {
						itemsCount,
						packageCount: packageIds.length,
						weight: totalWeight,
						unit: weightUnit,
					},
				}
			);
		}

		return { isSuccess: true, summary };
	};

	const toggleStepHandler = () => props.toggleStep( orderId, siteId, 'packages' );
	const confirmPackagesHandler = () => props.confirmPackages( orderId, siteId );
	return (
		<StepContainer
			title={ translate( 'Packages' ) }
			{ ...getContainerState() }
			expanded={ expanded }
			toggleStep={ toggleStepHandler }
		>
			<div className="packages-step__contents">
				<PackageList siteId={ props.siteId } orderId={ props.orderId } />
				{ packageIds.length ? (
					<PackageInfo siteId={ props.siteId } orderId={ props.orderId } />
				) : (
					<div key="no-packages" className="packages-step__package">
						{ translate( 'There are no packages or items associated with this order' ) }
					</div>
				) }
			</div>

			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) || ! packageIds.length }
				onClick={ confirmPackagesHandler }
			>
				{ translate( 'Use these packages' ) }
			</StepConfirmationButton>

			<MoveItemDialog siteId={ props.siteId } orderId={ props.orderId } />
			<AddItemDialog siteId={ props.siteId } orderId={ props.orderId } />
		</StepContainer>
	);
};

PackagesStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	selected: PropTypes.object.isRequired,
	weightUnit: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	expanded: PropTypes.bool,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const storeOptions = loaded ? shippingLabel.storeOptions : {};
	return {
		errors: loaded && getFormErrors( state, orderId, siteId ).packages,
		weightUnit: storeOptions.weight_unit,
		expanded: shippingLabel.form.packages.expanded,
		selected: shippingLabel.form.packages.selected,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep, confirmPackages }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( PackagesStep ) );
