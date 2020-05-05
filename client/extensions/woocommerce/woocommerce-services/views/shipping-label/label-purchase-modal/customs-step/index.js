/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PackageRow from './package-row';
import StepContainer from '../step-container';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import {
	toggleStep,
	confirmCustoms,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	isCustomsFormStepSubmitted,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import StepConfirmationButton from '../step-confirmation-button';
import getPackageDescriptions from '../packages-step/get-package-descriptions';
import { getAllPackageDefinitions } from 'woocommerce/woocommerce-services/state/packages/selectors';

const CustomsStep = ( props ) => {
	const { siteId, orderId, errors, expanded, translate, isSubmitted, packageDescriptions } = props;
	const summary = hasNonEmptyLeaves( errors )
		? translate( 'Customs information incomplete' )
		: translate( 'Customs information valid' );

	return (
		<StepContainer
			title={ translate( 'Customs' ) }
			summary={ isSubmitted ? summary : '' }
			expanded={ expanded }
			toggleStep={ props.toggleStep }
			isSuccess={ isSubmitted && ! hasNonEmptyLeaves( errors ) }
			isError={ isSubmitted && hasNonEmptyLeaves( errors ) }
		>
			{ Object.keys( packageDescriptions ).map( ( packageId, index ) => (
				<div className="customs-step__package-container" key={ packageId }>
					{ index ? <hr /> : null }
					<p className="customs-step__package-name">{ packageDescriptions[ packageId ] }</p>
					<PackageRow packageId={ packageId } siteId={ siteId } orderId={ orderId } />
				</div>
			) ) }
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) }
				onClick={ props.confirmCustoms }
			>
				{ translate( 'Save customs form' ) }
			</StepConfirmationButton>
		</StepContainer>
	);
};

CustomsStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	packageDescriptions: PropTypes.objectOf( PropTypes.string ).isRequired,
	expanded: PropTypes.bool,
	isSubmitted: PropTypes.bool.isRequired,
	errors: PropTypes.object,
	toggleStep: PropTypes.func.isRequired,
	confirmCustoms: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const packages = shippingLabel.form.packages.selected;

	return {
		packageDescriptions: getPackageDescriptions(
			packages,
			getAllPackageDefinitions( state, siteId ),
			true
		),
		expanded: shippingLabel.form.customs.expanded,
		isSubmitted: isCustomsFormStepSubmitted( state, orderId, siteId ),
		errors: loaded ? getFormErrors( state, orderId, siteId ).customs : {},
	};
};

const mapDispatchToProps = ( dispatch, { orderId, siteId } ) => ( {
	toggleStep: () => dispatch( toggleStep( orderId, siteId, 'customs' ) ),
	confirmCustoms: () => dispatch( confirmCustoms( orderId, siteId ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CustomsStep ) );
