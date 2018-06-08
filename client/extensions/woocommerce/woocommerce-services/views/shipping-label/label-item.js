/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import ClipboardButton from 'components/forms/clipboard-button';
import RefundDialog from './label-refund-modal';
import ReprintDialog from './label-reprint-modal';
import DetailsDialog from './label-details-modal';
import TrackingLink from './tracking-link';
import {
	openRefundDialog,
	openReprintDialog,
	openDetailsDialog,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { recordTracksEvent } from 'state/analytics/actions';

class LabelItem extends Component {
	state = {
		showTrackingCopyConfirmation: false,
	};

	componentWillUnmount() {
		clearTimeout( this.trackingCopyConfirmationTimer );
	}

	renderRefund = label => {
		const { orderId, siteId, translate } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if (
			label.anonymized ||
			label.usedDate ||
			( label.createdDate && label.createdDate < thirtyDaysAgo )
		) {
			return null;
		}

		const openDialog = () => {
			this.props.openRefundDialog( orderId, siteId, label.labelId );
		};

		return (
			<PopoverMenuItem onClick={ openDialog } icon="refund">
				{ translate( 'Request refund' ) }
			</PopoverMenuItem>
		);
	};

	renderReprint = label => {
		const todayTime = new Date().getTime();
		if (
			label.anonymized ||
			label.usedDate ||
			( label.expiryDate && label.expiryDate < todayTime )
		) {
			return null;
		}

		const { orderId, siteId, translate } = this.props;

		const openDialog = () => {
			this.props.openReprintDialog( orderId, siteId, label.labelId );
		};

		return (
			<PopoverMenuItem onClick={ openDialog } icon="print">
				{ translate( 'Reprint' ) }
			</PopoverMenuItem>
		);
	};

	renderLabelDetails = label => {
		const { orderId, siteId, translate } = this.props;

		const openDialog = () => {
			this.props.openDetailsDialog( orderId, siteId, label.labelId );
		};

		return (
			<PopoverMenuItem onClick={ openDialog } icon="info-outline">
				{ translate( 'View details' ) }
			</PopoverMenuItem>
		);
	};

	handleTrackingCopyClick = () => {
		this.setState( {
			showTrackingCopyConfirmation: true,
		} );

		clearTimeout( this.trackingCopyConfirmationTimer );

		this.trackingCopyConfirmationTimer = setTimeout( () => {
			this.setState( {
				showTrackingCopyConfirmation: false,
			} );
		}, 2000 );

		this.props.recordTracksEvent( 'calypso_woocommerce_order_tracking_number_copy', {
			carrier_id: this.props.label.carrierId,
		} );
	};

	render() {
		const { siteId, orderId, label, translate } = this.props;
		const {
			labelIndex,
			serviceName,
			packageName,
			productNames,
			receiptId,
			labelId,
			createdDate,
			refundableAmount,
			currency,
		} = label;

		return (
			<div className="shipping-label__item">
				<p className="shipping-label__item-detail">
					{ translate( '%(service)s label (#%(labelIndex)d) printed', {
						args: {
							service: label.serviceName,
							labelIndex: label.labelIndex + 1,
						},
					} ) }
					{ label.showDetails && (
						<span>
							<EllipsisMenu position="bottom left">
								{ this.renderLabelDetails( label ) }
								{ this.renderRefund( label ) }
								{ this.renderReprint( label ) }
							</EllipsisMenu>
							<DetailsDialog
								siteId={ siteId }
								orderId={ orderId }
								labelIndex={ labelIndex }
								serviceName={ serviceName }
								packageName={ packageName }
								productNames={ productNames }
								receiptId={ receiptId }
								labelId={ labelId }
							/>
							<RefundDialog
								siteId={ siteId }
								orderId={ orderId }
								createdDate={ createdDate }
								refundableAmount={ refundableAmount }
								currency={ currency }
								labelId={ labelId }
							/>
							<ReprintDialog siteId={ siteId } orderId={ orderId } labelId={ labelId } />
						</span>
					) }
				</p>
				{ label.showDetails && (
					<Fragment>
						<p className="shipping-label__item-tracking">
							{ translate( 'Tracking #: {{trackingLink/}}', {
								components: {
									trackingLink: (
										<TrackingLink tracking={ label.tracking } carrierId={ label.carrierId } />
									),
								},
							} ) }
						</p>
						<ClipboardButton
							compact
							onCopy={ this.handleTrackingCopyClick }
							text={ label.tracking }
						>
							{ this.state.showTrackingCopyConfirmation
								? translate( 'Copied!' )
								: translate( 'Copy to clipboard' ) }
						</ClipboardButton>
					</Fragment>
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
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators(
		{
			openRefundDialog,
			openReprintDialog,
			openDetailsDialog,
			recordTracksEvent,
		},
		dispatch
	);
};

export default connect(
	null,
	mapDispatchToProps
)( localize( LabelItem ) );
