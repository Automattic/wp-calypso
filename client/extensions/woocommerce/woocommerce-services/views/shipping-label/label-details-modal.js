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
import Dialog from 'components/dialog';
import ActionButtons from 'woocommerce/woocommerce-services/components/action-buttons';
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeDetailsDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const DetailsDialog = ( props ) => {
	const { orderId, siteId, detailsDialog, labelId, labelIndex, serviceName, packageName, productNames, translate } = props;

	const onClose = () => props.closeDetailsDialog( orderId, siteId );
	return (
		<Dialog
			additionalClassNames="label-details-modal woocommerce"
			isVisible={ Boolean( detailsDialog && detailsDialog.labelId === labelId ) }
			onClose={ onClose }>
			<FormSectionHeading>
				{ translate( 'Label #%(labelIndex)s details', { args: { labelIndex: labelIndex + 1 } } ) }
			</FormSectionHeading>
			<dl>
				<dt>{ translate( 'Service' ) }</dt>
				<dd>{ serviceName }</dd>

				<dt>{ translate( 'Package' ) }</dt>
				<dd>{ packageName }</dd>

				<dt>{ translate( 'Items' ) }</dt>
				<dd>
					<ul>
						{ productNames.map( productName => <li>{ productName }</li> ) }
					</ul>
				</dd>
			</dl>
			<ActionButtons buttons={ [
				{
					isPrimary: true,
					onClick: onClose,
					label: translate( 'OK' ),
				},
			] } />
		</Dialog>
	);
};

DetailsDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	detailsDialog: PropTypes.object,
	labelId: PropTypes.number,
	serviceName: PropTypes.string,
	packageName: PropTypes.string,
	productNames: PropTypes.array,
	closeDetailsDialog: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	return {
		detailsDialog: loaded ? shippingLabel.detailsDialog : {},
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeDetailsDialog }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( DetailsDialog ) );
