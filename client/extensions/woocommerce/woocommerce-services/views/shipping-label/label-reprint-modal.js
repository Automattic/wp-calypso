/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import { getPaperSizes } from 'woocommerce/woocommerce-services/lib/pdf-label-utils';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeReprintDialog, confirmReprint, updatePaperSize } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class ReprintDialog extends Component {
	onClose = () => this.props.closeReprintDialog( this.props.orderId, this.props.siteId );
	onConfirm = () => this.props.confirmReprint( this.props.orderId, this.props.siteId );
	onPaperSizeChange = ( value ) => this.props.updatePaperSize( this.props.orderId, this.props.siteId, value );

	render() {
		const { reprintDialog, paperSize, storeOptions, labelId, translate, download } = this.props;
		const { labelId: reprintLabelId, isFetching } = reprintDialog || {};

		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ), onClick: this.onClose },
			{
				action: 'confirm',
				onClick: this.onConfirm,
				isPrimary: true,
				disabled: isFetching,
				additionalClassNames: isFetching ? 'is-busy' : '',
				label: download ? translate( 'Download' ) : translate( 'Print' ),
			},
		];

		return (
			<Dialog
				isVisible={ reprintLabelId === labelId }
				onClose={ this.onClose }
				buttons={ buttons }
				additionalClassNames="label-reprint-modal woocommerce wcc-root">
				<FormSectionHeading>
					{ download ? translate( 'Download shipping label' ) : translate( 'Reprint shipping label' ) }
				</FormSectionHeading>
				<p>
					{ download
						? translate( 'If there was a download error when you purchased the label, you can download it again.' )
						: translate( 'If there was a printing error when you purchased the label, you can print it again.' )
					}
				</p>
				<p className="shipping-label__reprint-modal-notice">
					{ translate( 'NOTE: If you already used the label in a package, printing and using it again ' +
						'is a violation of our terms of service and may result in criminal charges.' ) }
				</p>
				<Dropdown
					id={ 'paper_size' }
					valuesMap={ getPaperSizes( storeOptions.origin_country ) }
					title={ translate( 'Paper size' ) }
					value={ paperSize }
					updateValue={ this.onPaperSizeChange } />
			</Dialog>
		);
	}
}

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
	download: PropTypes.bool,
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
