/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';
import { translate as __, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RefundDialog from './label-refund-modal';
import ReprintDialog from './label-reprint-modal';
import TrackingLink from './tracking-link';
//import InfoTooltip from 'components/info-tooltip';
import { openRefundDialog, openReprintDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

const formatDate = ( date ) => {
	return moment( date ).format( 'MMMM Do YYYY, h:mm a' );
};

class LabelItem extends Component {
	renderRefundLink = ( label ) => {
		const { orderId, siteId } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if ( ( label.used_date && label.used_date < today.getTime() ) || ( label.created_date && label.created_date < thirtyDaysAgo ) ) {
			return null;
		}

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openRefundDialog( orderId, siteId, label.label_id );
		};

		return (
			<span>
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >
					<Gridicon icon="refund" size={ 12 } />{ __( 'Request refund' ) }
				</a>
			</span>
		);
	};

	renderRefund = ( label ) => {
		if ( ! label.refund ) {
			return this.renderRefundLink( label );
		}

		let text = '';
		let className = '';
		switch ( label.refund.status ) {
			case 'pending':
				if ( label.statusUpdated ) {
					className = 'is-refund-pending';
					text = __( 'Refund pending' );
				} else {
					className = 'is-refund-checking';
					text = __( 'Checking refund status' );
				}
				break;
			case 'complete':
				className = 'is-refund-complete';
				text = __( 'Refunded on %(date)s', { args: { date: formatDate( label.refund.refund_date ) } } );
				break;
			case 'rejected':
				className = 'is-refund-rejected';
				text = __( 'Refund rejected' );
				break;
			default:
				return this.renderRefundLink( label );
		}

		return (
			<span className={ className } ><Gridicon icon="time" size={ 12 } />{ text }</span>
		);
	};

	renderReprint = ( label ) => {
		const todayTime = new Date().getTime();
		if ( label.refund ||
			( label.used_date && label.used_date < todayTime ) ||
			( label.expiry_date && label.expiry_date < todayTime ) ) {
			return null;
		}

		const { orderId, siteId } = this.props;

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openReprintDialog( orderId, siteId, label.label_id );
		};

		return (
			<span>
				<ReprintDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >
					<Gridicon icon="print" size={ 12 } />{ __( 'Reprint' ) }
				</a>
			</span>
		);
	};

	renderLabelDetails = ( label ) => {
		if ( ! label.package_name || ! label.product_names ) {
			return null;
		}

		return (
			<span className="shipping-label__item-detail">
				{ __( 'Label #%(labelNum)s', { args: { labelNum: this.props.labelNum } } ) }
			</span>
		);
		// return (
		// 	<InfoTooltip anchor={ tooltipAnchor }>
		// 		<h3>{ label.package_name }</h3>
		// 		<p>{ label.service_name }</p>
		// 		<ul>
		// 			{ label.product_names.map( ( productName, productIdx ) => <li key={ productIdx }>{ productName }</li> ) }
		// 		</ul>
		// 	</InfoTooltip>
		// );
	};

	render() {
		const { label } = this.props;
		const purchased = moment( label.created ).fromNow();

		return (
			<div key={ label.label_id } className="shipping-label__item" >
				<p className="shipping-label__item-created">
					{ __( '{{labelDetails/}} purchased {{purchasedAt/}}', {
						components: {
							labelDetails: this.renderLabelDetails( label ),
							purchasedAt: <span title={ formatDate( label.created ) }>{ purchased }</span>
						}
					} ) }
				</p>
				<p className="shipping-label__item-tracking">
					{ __( 'Tracking #: {{trackingLink/}}', { components: { trackingLink: <TrackingLink { ...label } /> } } ) }
				</p>
				<p className="shipping-label__item-actions" >
					{ this.renderRefund( label ) }
					{ this.renderReprint( label ) }
				</p>
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
