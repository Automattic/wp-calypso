/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import LabelSettings from '../../label-settings/label-settings';
import PriceSummary from './price-summary';
import {
	setEmailDetailsOption,
	setFulfillOrderOption,
	updatePaperSize,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
	shouldFulfillOrder,
	shouldEmailDetails,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const Sidebar = ( props ) => {
	const { orderId, siteId, errors, paperSize, translate, fulfillOrder, emailDetails } = props;

	const onEmailDetailsChange = () => props.setEmailDetailsOption( orderId, siteId, ! emailDetails );
	const onFulfillOrderChange = () => props.setFulfillOrderOption( orderId, siteId, ! fulfillOrder );
	const setValue = ( key, value ) => {
		switch ( key ) {
			case 'paper_size':
				props.updatePaperSize( orderId, siteId, value );
				break;
			case 'selected_payment_method_id':
			case 'email_receipts':
				break;
		}
	};

	return (
		<div className="label-purchase-modal__sidebar">
			<PriceSummary siteId={ siteId } orderId={ orderId } />
			<LabelSettings siteId={ siteId } setValue={ setValue } paperSize={ paperSize } errors={ errors } />
			<FormLabel className="label-purchase-modal__option-email-customer">
				<FormCheckbox checked={ emailDetails } onChange={ onEmailDetailsChange } />
				<span>{ translate( 'Email shipment details to the customer' ) }</span>
			</FormLabel>
			<FormLabel className="label-purchase-modal__option-mark-order-fulfilled">
				<FormCheckbox checked={ fulfillOrder } onChange={ onFulfillOrderChange } />
				<span>{ translate( 'Mark the order as fulfilled' ) }</span>
			</FormLabel>
		</div>
	);
};

Sidebar.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	paperSize: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		paperSize: shippingLabel.paperSize,
		errors: loaded && getFormErrors( state, orderId, siteId ).sidebar,
		fulfillOrder: loaded && shouldFulfillOrder( state, orderId, siteId ),
		emailDetails: loaded && shouldEmailDetails( state, orderId, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		setEmailDetailsOption,
		setFulfillOrderOption,
		updatePaperSize,
	}, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( Sidebar ) );
