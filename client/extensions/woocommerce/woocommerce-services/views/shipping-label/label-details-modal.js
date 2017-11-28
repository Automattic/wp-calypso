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
import FormSectionHeading from 'components/forms/form-section-heading';
import { closeDetailsDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

const DetailsDialog = ( props ) => {
	const { orderId, siteId, isVisible, labelIndex, serviceName, packageName, productNames, translate } = props;

	const onClose = () => props.closeDetailsDialog( orderId, siteId );
	const buttons = [
		{ action: 'close', label: translate( 'Close' ), onClick: onClose },
	];

	return (
		<Dialog
			additionalClassNames="label-details-modal woocommerce wcc-root"
			isVisible={ isVisible }
			onClose={ onClose }
			buttons={ buttons }>
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
						{ productNames.map( ( productName, i ) => <li key={ i }>{ productName }</li> ) }
					</ul>
				</dd>
			</dl>
		</Dialog>
	);
};

DetailsDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	isVisible: PropTypes.bool,
	serviceName: PropTypes.string,
	packageName: PropTypes.string,
	productNames: PropTypes.array,
	closeDetailsDialog: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { orderId, siteId, labelId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const { detailsDialog } = getShippingLabel( state, orderId, siteId );
	return {
		isVisible: Boolean( loaded && detailsDialog && detailsDialog.labelId === labelId ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeDetailsDialog }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( DetailsDialog ) );
