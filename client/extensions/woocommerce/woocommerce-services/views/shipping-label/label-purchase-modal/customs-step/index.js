/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { find, get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Checkbox from 'woocommerce/woocommerce-services/components/checkbox';
import StepContainer from '../step-container';
import { hasNonEmptyLeaves } from 'woocommerce/woocommerce-services/lib/utils/tree';
import { toggleStep, confirmCustoms } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import StepConfirmationButton from '../step-confirmation-button';

const CustomsStep = ( props ) => {
	const {
		siteId,
		orderId,
		dummyField,
		errors,
		expanded,
		translate,
	} = props;
	const summary = hasNonEmptyLeaves( errors ) ? 'Errors here' : 'Customs form looks good';
	const toggleStepHandler = () => props.toggleStep( orderId, siteId, 'customs' );
	const confirmCustomsHandler = () => props.confirmCustoms( orderId, siteId );
	const toggleDummyFieldHandler = () => props.toggleDummyField( orderId, siteId, ! dummyField );

	return (
		<StepContainer
			title={ translate( 'Customs' ) }
			summary={ summary }
			expanded={ expanded }
			toggleStep={ toggleStepHandler }
			isSuccess={ ! hasNonEmptyLeaves( errors ) }
			isError={ hasNonEmptyLeaves( errors ) } >
			<label>
				<Checkbox checked={ Boolean( dummyField ) } onChange={ toggleDummyFieldHandler } />
				Check this to make validation pass
			</label>
			<StepConfirmationButton
				disabled={ hasNonEmptyLeaves( errors ) }
				onClick={ confirmCustomsHandler } >
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
		...shippingLabel.form.customs,
		errors: loaded && getFormErrors( state, orderId, siteId ).customs,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		toggleStep,
		confirmCustoms,
		toggleDummyField: ( orderId, siteId, value ) => ( {
			type: 'WOOCOMMERCE_SERVICES_SHIPPING_LABEL_CUSTOMS_TOGGLE_DUMMY_FIELD',
			siteId,
			orderId,
			value,
		} ),
	}, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( CustomsStep ) );
