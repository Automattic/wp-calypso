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
	openRefundDialog = ( e ) => {
		const { orderId, siteId, label } = this.props;
		e.preventDefault();
		this.props.openRefundDialog( orderId, siteId, label.labelId );
	};

	renderRefund = () => {
		const { orderId, siteId, label, translate } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if ( label.usedDate || ( label.createdDate && label.createdDate < thirtyDaysAgo ) ) {
			return null;
		}

		return (
			<span>
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<button onClick={ this.openRefundDialog }>{ translate( 'Request refund' ) }</button>
			</span>
		);
	};

	openReprintDialog = ( e ) => {
		const { orderId, siteId, label } = this.props;
		e.preventDefault();
		this.props.openReprintDialog( orderId, siteId, label.labelId );
	};

	renderReprint = () => {
		const { orderId, siteId, label, translate } = this.props;

		const todayTime = new Date().getTime();
		if ( label.usedDate ||
			( label.expiryDate && label.expiryDate < todayTime ) ) {
			return null;
		}

		return (
			<span>
				<ReprintDialog siteId={ siteId } orderId={ orderId } download={ label.returningLabelIndex != null } { ...label } />
				<button onClick={ this.openReprintDialog }>
					{ label.returningLabelIndex == null ? translate( 'Reprint' ) : translate( 'Download' ) }
				</button>
			</span>
		);
	};

	openDetailsDialog = ( e ) => {
		const { orderId, siteId, label } = this.props;
		e.preventDefault();
		this.props.openDetailsDialog( orderId, siteId, label.labelId );
	};

	renderLabelDetails = () => {
		const { orderId, siteId, label, translate } = this.props;
		return (
			<span>
				<DetailsDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<button onClick={ this.openDetailsDialog } >{ translate( 'View details' ) }</button>
			</span>
		);
	};

	openReturnDialog = ( e ) => {
		const { orderId, siteId, label } = this.props;
		e.preventDefault();
		this.props.openReturnDialog( orderId, siteId, label.labelId );
	};

	renderReturn = () => {
		const { orderId, siteId, label, translate } = this.props;
		return (
			<span>
				<ReturnDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<button type="button" onClick={ this.openReturnDialog } >{ translate( 'Create return label' ) }</button>
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
					{ label.showDetails && this.renderLabelDetails() }
				</p>
				{ label.showDetails &&
					<p className="shipping-label__item-tracking">
						{ translate( 'Tracking #: {{trackingLink/}}', { components: { trackingLink: <TrackingLink { ...label } /> } } ) }
					</p>
				}
				{ label.showDetails &&
					<p className="shipping-label__item-actions">
						{ this.renderRefund() }
						{ this.renderReprint() }
					</p>
				}
				{ label.returningLabelIndex == null ? (
					<p className="shipping-label__item-actions">
						{ label.showDetails && this.renderReturn() }
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
