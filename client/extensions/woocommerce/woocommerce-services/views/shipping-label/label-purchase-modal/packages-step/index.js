/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PackageList from './list';
import PackageInfo from './package-info';
import MoveItemDialog from './move-item';
import AddItemDialog from './add-item';
import StepConfirmationButton from '../step-confirmation-button';
import Notice from 'components/notice';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import StepContainer from '../step-container';
import getFormErrors from 'woocommerce/woocommerce-services/state/shipping-label/selectors/errors';
import { toggleStep, confirmPackages } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const PackagesStep = ( props ) => {
	const {
		selected,
		all,
		weightUnit,
		errors,
		expanded,
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
					unit: weightUnit,
				},
			} );
		} else if ( 1 === packageIds.length ) {
			summary = __( '%(itemsCount)d items in 1 package: %(weight)f %(unit)s total', {
				args: {
					itemsCount,
					weight: totalWeight,
					unit: weightUnit,
				},
			} );
		} else {
			summary = __( '%(itemsCount)d items in %(packageCount)d packages: %(weight)f %(unit)s total', {
				args: {
					itemsCount,
					packageCount: packageIds.length,
					weight: totalWeight,
					unit: weightUnit,
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
			return <Notice
			className="error-notice"
			status="is-warning"
			showDismiss={ false } >
				<span>{ __(
					'There are no packages configured. The items have been packed individually. ' +
					'You can add or enable packages using the {{a}}Packaging Manager{{/a}}.',
					{ components: { a: <a href="admin.php?page=wc-settings&tab=shipping&section=package-settings" /> } }
				) }</span>
			</Notice>;
		}

		return null;
	};

	const toggleStepHandler = () => props.toggleStep( 'packages' );
	return (
		<StepContainer
			title={ __( 'Packages' ) }
			{ ...getContainerState() }
			expanded={ expanded }
			toggleStep={ toggleStepHandler } >

			{ renderWarning() }
			<div className="packages-step__contents">
				<PackageList />
				{ packageIds.length
					? <PackageInfo />
					: ( <div key="no-packages" className="packages-step__package">
							{ __( 'There are no packages or items associated with this order' ) }
						</div> )
				}
			</div>

			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) || ! packageIds.length }
				onClick={ props.confirmPackages } >
					{ __( 'Use these packages' ) }
			</StepConfirmationButton>

			<MoveItemDialog />
			<AddItemDialog />
		</StepContainer>
	);
};

PackagesStep.propTypes = {
	selected: PropTypes.object.isRequired,
	all: PropTypes.object.isRequired,
	weightUnit: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	expanded: PropTypes.bool,
};

const mapStateToProps = ( state ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};
	return {
		errors: loaded && getFormErrors( state, storeOptions ).packages,
		weightUnit: storeOptions.weight_unit,
		expanded: state.shippingLabel.form.packages.expanded,
		selected: state.shippingLabel.form.packages.selected,
		all: state.shippingLabel.form.packages.all,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { toggleStep, confirmPackages }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( PackagesStep );
