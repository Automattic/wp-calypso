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
import { Dialog } from '@automattic/components';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import FormSectionHeading from 'components/forms/form-section-heading';
import {
	closeReprintDialog,
	confirmReprint,
	updatePaperSize,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	isLoaded,
	getShippingLabel,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const ReprintDialog = ( props ) => {
	const { orderId, siteId, reprintDialog, paperSize, storeOptions, labelId, translate } = props;

	const onClose = () => props.closeReprintDialog( orderId, siteId );
	const onConfirm = () => props.confirmReprint( orderId, siteId );
	const onPaperSizeChange = ( value ) => props.updatePaperSize( orderId, siteId, value );

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ), onClick: onClose },
		{
			action: 'confirm',
			onClick: onConfirm,
			isPrimary: true,
			disabled: reprintDialog && ! reprintDialog.fileData,
			additionalClassNames: reprintDialog && reprintDialog.isFetching ? 'is-busy' : '',
			label: translate( 'Print' ),
		},
	];

	return (
		<Dialog
			isVisible={ Boolean( reprintDialog && reprintDialog.labelId === labelId ) }
			onClose={ onClose }
			buttons={ buttons }
			additionalClassNames="label-reprint-modal woocommerce wcc-root"
		>
			<FormSectionHeading>{ translate( 'Reprint shipping label' ) }</FormSectionHeading>
			<p>
				{ translate(
					'If there was a printing error when you purchased the label, you can print it again.'
				) }
			</p>
			<p className="shipping-label__reprint-modal-notice">
				{ translate(
					'NOTE: If you already used the label in a package, printing and using it again ' +
						'is a violation of our terms of service and may result in criminal charges.'
				) }
			</p>
			<Dropdown
				id={ 'paper_size' }
				valuesMap={ getPaperSizes( storeOptions.origin_country ) }
				title={ translate( 'Paper size' ) }
				value={ paperSize }
				updateValue={ onPaperSizeChange }
			/>
		</Dialog>
	);
};

ReprintDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	reprintDialog: PropTypes.object,
	paperSize: PropTypes.string.isRequired,
	storeOptions: PropTypes.object.isRequired,
	labelId: PropTypes.number,
	closeReprintDialog: PropTypes.func.isRequired,
	confirmReprint: PropTypes.func.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		reprintDialog: loaded ? shippingLabel.reprintDialog : {},
		paperSize: shippingLabel.paperSize,
		storeOptions: loaded ? shippingLabel.storeOptions : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeReprintDialog, confirmReprint, updatePaperSize }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ReprintDialog ) );
