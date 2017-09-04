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
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import getFormErrors from 'woocommerce/woocommerce-services/state/shipping-label/selectors/errors';
import { updatePaperSize } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const Sidebar = ( props ) => {
	const { form, errors, paperSize } = props;

	return (
		<div className="label-purchase-modal__sidebar">
			<Dropdown
				id={ 'paper_size' }
				valuesMap={ getPaperSizes( form.origin.values.country ) }
				title={ __( 'Paper size' ) }
				value={ paperSize }
				updateValue={ props.updatePaperSize }
				error={ errors.paperSize } />
		</div>
	);
};

Sidebar.propTypes = {
	paperSize: PropTypes.string.isRequired,
	errors: PropTypes.object.isRequired,
	form: PropTypes.object.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const loaded = state.shippingLabel.loaded;
	const storeOptions = loaded ? state.shippingLabel.storeOptions : {};
	return {
		paperSize: state.shippingLabel.paperSize,
		form: state.shippingLabel.form,
		errors: loaded && getFormErrors( state, storeOptions ).sidebar,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { updatePaperSize }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( Sidebar );
