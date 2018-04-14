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
import RefundDialog from './label-refund-modal';
import ReprintDialog from './label-reprint-modal';
import DetailsDialog from './label-details-modal';
import ReturnDialog from './label-return-modal';
import TrackingLink from './tracking-link';
import {
	openRefundDialog,
	openReprintDialog,
	openDetailsDialog,
	openReturnDialog,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';

class LabelItem extends Component {
	renderRefund = ( label ) => {
		const { orderId, siteId, translate } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if ( label.usedDate || ( label.createdDate && label.createdDate < thirtyDaysAgo ) ) {
			return null;
		}

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openRefundDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >{ translate( 'Request refund' ) }</a>
			</span>
		);
	};

	renderReprint = ( label ) => {
		const todayTime = new Date().getTime();
		if ( label.usedDate ||
			( label.expiryDate && label.expiryDate < todayTime ) ) {
			return null;
		}

		const { orderId, siteId, translate } = this.props;

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openReprintDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<ReprintDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >{ translate( 'Reprint' ) }</a>
			</span>
		);
	};

	renderLabelDetails = ( label ) => {
		const { orderId, siteId, translate } = this.props;

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openDetailsDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<DetailsDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >{ translate( 'View details' ) }</a>
			</span>
		);
	};

	renderReturn = ( label ) => {
		const { orderId, siteId, translate } = this.props;

		const openDialog = ( e ) => {
			e.preventDefault();
			this.props.openReturnDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<ReturnDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >{ translate( 'Create return label' ) }</a>
			</span>
		);
	};

	render() {
		const { label, translate } = this.props;

		return (
			<div key={ label.labelId } className="shipping-label__item" >
				<p className="shipping-label__item-detail">
					<span>
						{ translate( 'Label #%(labelIndex)s printed', {
							args: {
								labelIndex: label.labelIndex + 1,
							},
						} ) }
					</span>
					{ label.showDetails && this.renderLabelDetails( label ) }
				</p>
				{ label.showDetails &&
					<p className="shipping-label__item-tracking">
						{ translate( 'Tracking #: {{trackingLink/}}', { components: { trackingLink: <TrackingLink { ...label } /> } } ) }
					</p>
				}
				{ label.showDetails &&
					<p className="shipping-label__item-actions">
						{ this.renderRefund( label ) }
						{ this.renderReprint( label ) }
					</p>
				}
				{ label.returningLabelIndex == null ? (
					<p className="shipping-label__item-actions">
						{ label.showDetails && this.renderReturn( label ) }
					</p>
				) : (
					<p>
						{ translate( 'Return for Label #%(labelIndex)s', {
							args: { labelIndex: label.returningLabelIndex + 1 },
						} ) }
					</p>
				) }
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
	openDetailsDialog: PropTypes.func.isRequired,
	openReturnDialog: PropTypes.func.isRequired,
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( {
		openRefundDialog,
		openReprintDialog,
		openDetailsDialog,
		openReturnDialog,
	}, dispatch );
};

export default connect( null, mapDispatchToProps )( localize( LabelItem ) );
