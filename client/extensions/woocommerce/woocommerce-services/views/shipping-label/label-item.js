/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import RefundDialog from './label-refund-modal';
import ReprintDialog from './label-reprint-modal';
import TrackingLink from './tracking-link';
//import InfoTooltip from 'components/info-tooltip';
import { openRefundDialog, openReprintDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

// const formatDate = ( date ) => {
// 	return moment( date ).format( 'MMMM Do YYYY, h:mm a' );
// };

class LabelItem extends Component {
	renderRefund = ( label ) => {
		const { orderId, siteId } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if ( ( label.usedDate && label.usedDate < today.getTime() ) || ( label.createdDate && label.createdDate < thirtyDaysAgo ) ) {
			return null;
		}

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openRefundDialog( orderId, siteId, label.labelId );
		};

		return (
			<Button compact onClick={ openDialog } >
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<Gridicon icon="refund" size={ 12 } />{ __( 'Request refund' ) }
			</Button>
		);
	};

	renderReprint = ( label ) => {
		const todayTime = new Date().getTime();
		if ( ( label.usedDate && label.usedDate < todayTime ) ||
			( label.expiryDate && label.expiryDate < todayTime ) ) {
			return null;
		}

		const { orderId, siteId } = this.props;

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openReprintDialog( orderId, siteId, label.labelId );
		};

		return (
			<Button compact onClick={ openDialog }>
				<ReprintDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<Gridicon icon="print" size={ 12 } />{ __( 'Reprint' ) }
			</Button>
		);
	};

	renderLabelDetails = ( label ) => {
		if ( ! label.packageName || ! label.productNames ) {
			return null;
		}

		return (
			<span className="shipping-label__item-detail">
				{ __( 'Label #%(labelIndex)s', { args: { labelIndex: label.labelIndex + 1 } } ) }
			</span>
		);
		// return (
		// 	<InfoTooltip anchor={ tooltipAnchor }>
		// 		<h3>{ label.packageName }</h3>
		// 		<p>{ label.serviceName }</p>
		// 		<ul>
		// 			{ label.productNames.map( ( productName, productIdx ) => <li key={ productIdx }>{ productName }</li> ) }
		// 		</ul>
		// 	</InfoTooltip>
		// );
	};

	render() {
		const { label } = this.props;

		return (
			<div key={ label.labelId } className="shipping-label__item" >
				<p className="shipping-label__item-created">
					{ __( '{{labelDetails/}} purchased', {
						components: {
							labelDetails: this.renderLabelDetails( label ),
						}
					} ) }
				</p>
				<p className="shipping-label__item-tracking">
					{ __( 'Tracking #: {{trackingLink/}}', { components: { trackingLink: <TrackingLink { ...label } /> } } ) }
				</p>
				{ label.showDetails &&
					<p className="shipping-label__item-actions">
						<ButtonGroup>
							{ this.renderRefund( label ) }
							{ this.renderReprint( label ) }
						</ButtonGroup>
					</p>
				}
			</div>
		);
	}
}

LabelItem.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	label: PropTypes.object.isRequired,
	openRefundDialog: PropTypes.func.isRequired,
	openReprintDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { openRefundDialog, openReprintDialog }, dispatch );
};

export default connect( null, mapDispatchToProps )( LabelItem );
