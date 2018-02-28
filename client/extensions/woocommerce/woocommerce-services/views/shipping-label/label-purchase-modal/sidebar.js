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
	setSettingsValue,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	isLoaded,
	getFormErrors,
	getSettingsValues,
	shouldFulfillOrder,
	shouldEmailDetails,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const Sidebar = ( props ) => {
	const { orderId, siteId, errors, settings, translate, fulfillOrder, emailDetails } = props;

	const onEmailDetailsChange = () => props.setEmailDetailsOption( orderId, siteId, ! emailDetails );
	const onFulfillOrderChange = () => props.setFulfillOrderOption( orderId, siteId, ! fulfillOrder );
	const onSettingsChange = ( key, value ) => props.setSettingsValue( orderId, siteId, key, value );

	return (
		<div className="label-purchase-modal__sidebar">
			<PriceSummary siteId={ siteId } orderId={ orderId } />
			<LabelSettings
				siteId={ siteId }
				setValue={ onSettingsChange }
				errors={ errors }
				values={ settings }
			/>
			<hr />
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
	settings: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired,
	setSettingsValue: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	return {
		errors: loaded && getFormErrors( state, orderId, siteId ).sidebar,
		settings: loaded && getSettingsValues( state, orderId, siteId ),
		fulfillOrder: loaded && shouldFulfillOrder( state, orderId, siteId ),
		emailDetails: loaded && shouldEmailDetails( state, orderId, siteId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		setEmailDetailsOption,
		setFulfillOrderOption,
		setSettingsValue,
	}, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( Sidebar ) );
