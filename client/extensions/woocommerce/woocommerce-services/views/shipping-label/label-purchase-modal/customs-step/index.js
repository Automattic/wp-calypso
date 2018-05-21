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
import StepContainer from '../step-container';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import { toggleStep, confirmCustoms } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	isCustomsFormStepSubmitted,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import StepConfirmationButton from '../step-confirmation-button';
import Checkbox from 'woocommerce/woocommerce-services/components/checkbox';

const CustomsStep = ( props ) => {
	const {
		errors,
		expanded,
		translate,
		isSubmitted,
		dummyFieldChecked,
	} = props;
	const summary = hasNonEmptyLeaves( errors ) ? translate( 'Customs information incomplete' ) : translate( 'Customs information valid' );

	return (
		<StepContainer
			title={ translate( 'Customs' ) }
			summary={ isSubmitted ? summary : '' }
			expanded={ expanded }
			toggleStep={ props.toggleStep }
			isSuccess={ isSubmitted && ! hasNonEmptyLeaves( errors ) }
			isError={ isSubmitted && hasNonEmptyLeaves( errors ) } >
			<Checkbox checked={ Boolean( dummyFieldChecked ) } onChange={ props.toggleDummyField } /> Check this to make validation pass.
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) }
				onClick={ props.confirmCustoms } >
				{ translate( 'Confirm' ) }
			</StepConfirmationButton>
		</StepContainer>
	);
};

CustomsStep.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );

	return {
		expanded: shippingLabel.form.customs.expanded,
		dummyFieldChecked: shippingLabel.form.customs.dummyFieldChecked,
		isSubmitted: isCustomsFormStepSubmitted( state, orderId, siteId ),
		errors: loaded ? getFormErrors( state, orderId, siteId ).customs : {},
	};
};

const mapDispatchToProps = ( dispatch, { orderId, siteId } ) => ( {
	toggleStep: () => dispatch( toggleStep( orderId, siteId, 'customs' ) ),
	confirmCustoms: () => dispatch( confirmCustoms( orderId, siteId ) ),
	toggleDummyField: ( ev ) => dispatch( { type: 'WCS_TOGGLE_DUMMY_FIELD', orderId, siteId, value: ev.target.checked } ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CustomsStep ) );
