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
import Dialog from 'components/dialog';
import ActionButtons from 'woocommerce/woocommerce-services/components/action-buttons';
import Dropdown from 'components/dropdown';
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeReprintDialog, confirmReprint, updatePaperSize } from '../../state/actions';

const ReprintDialog = ( props ) => {
	const { reprintDialog, paperSize, storeOptions, label_id } = props;
	return (
		<Dialog
			isVisible={ Boolean( reprintDialog && reprintDialog.labelId === label_id ) }
			onClose={ props.closeReprintDialog }
			additionalClassNames="label-reprint-modal woocommerce">
			<FormSectionHeading>
				{ __( 'Reprint shipping label' ) }
			</FormSectionHeading>
			<p>
				{ __( 'If there was a printing error when you purchased the label, you can print it again.' ) }
			</p>
			<p className="label-reprint-modal__notice">
				{ __( 'NOTE: If you already used the label in a package, printing and using it again ' +
					'is a violation of our terms of service and may result in criminal charges.' ) }
			</p>
			<Dropdown
				id={ 'paper_size' }
				valuesMap={ getPaperSizes( storeOptions.origin_country ) }
				title={ __( 'Paper size' ) }
				value={ paperSize }
				updateValue={ props.updatePaperSize } />
			<ActionButtons buttons={ [
				{
					onClick: props.confirmReprint,
					isPrimary: true,
					isDisabled: reprintDialog && reprintDialog.isFetching,
					label: __( 'Print' ),
				},
				{
					onClick: props.closeReprintDialog,
					label: __( 'Cancel' ),
				},
			] } />
		</Dialog>
	);
};

ReprintDialog.propTypes = {
	reprintDialog: PropTypes.object,
	paperSize: PropTypes.string.isRequired,
	storeOptions: PropTypes.object.isRequired,
	closeReprintDialog: PropTypes.func.isRequired,
	confirmReprint: PropTypes.func.isRequired,
	updatePaperSize: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const shippingLabel = state.shippingLabel;
	const loaded = shippingLabel.loaded;
	return {
		reprintDialog: loaded ? shippingLabel.reprintDialog : {},
		paperSize: shippingLabel.paperSize,
		storeOptions: loaded ? shippingLabel.storeOptions : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeReprintDialog, confirmReprint, updatePaperSize }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( ReprintDialog );
