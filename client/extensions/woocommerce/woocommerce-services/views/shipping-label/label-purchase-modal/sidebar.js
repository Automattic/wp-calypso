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
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
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
	const { orderId, siteId, form, errors, paperSize, translate, fulfillOrder, emailDetails } = props;

	const onEmailDetailsChange = () => props.setEmailDetailsOption( orderId, siteId, ! emailDetails );
	const onFulfillOrderChange = () => props.setFulfillOrderOption( orderId, siteId, ! fulfillOrder );
	const onPaperSizeChange = ( value ) => props.updatePaperSize( orderId, siteId, value );

	return (
		<div className="label-purchase-modal__sidebar">
			<PriceSummary siteId={ siteId } orderId={ orderId } />
			<Dropdown
				id={ 'paper_size' }
				valuesMap={ getPaperSizes( form.origin.values.country ) }
				title={ translate( 'Paper size' ) }
				value={ paperSize }
				updateValue={ onPaperSizeChange }
				error={ errors.paperSize }
			/>
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
	form: PropTypes.object.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		paperSize: shippingLabel.paperSize,
		form: shippingLabel.form,
		errors: loaded && getFormErrors( state, orderId, siteId ).sidebar,
		fulfillOrder: loaded && shouldFulfillOrder( state, orderId, siteId ),
		emailDetails: loaded && shouldEmailDetails( state, orderId, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators(
		{
			setEmailDetailsOption,
			setFulfillOrderOption,
			updatePaperSize,
		},
		dispatch
	);
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( Sidebar ) );
