/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Gridicon from 'gridicons';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import LoadingSpinner from 'components/loading-spinner';
import PurchaseDialog from './components/label-purchase-modal';
import QueryLabels from 'components/query-labels';
import RefundDialog from './components/label-refund-modal';
import ReprintDialog from './components/label-reprint-modal';
import TrackingLink from './components/tracking-link';
import InfoTooltip from 'components/info-tooltip';
import formatDate from 'lib/utils/format-date';
import timeAgo from 'lib/utils/time-ago';
import * as ShippingLabelActions from './state/actions';
import notices from 'notices';
import GlobalNotices from 'components/global-notices';
import getFormErrors from './state/selectors/errors';
import canPurchase from './state/selectors/can-purchase';
import Notice from 'components/notice';

class ShippingLabelRootView extends Component {
	componentWillMount() {
		if ( this.props.needToFetchLabelStatus ) {
			this.props.labelActions.fetchLabelsStatus();
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.needToFetchLabelStatus ) {
			this.props.labelActions.fetchLabelsStatus();
		}
	}

	renderPaymentInfo = () => {
		const numPaymentMethods = this.props.shippingLabel.numPaymentMethods;
		const paymentMethod = this.props.shippingLabel.paymentMethod;

		if ( numPaymentMethods > 0 && paymentMethod ) {
			return (
				<Notice isCompact showDismiss={ false } className="shipping-label__payment inline">
					<p>
						{ __( 'Labels will be purchased using card ending: {{strong}}%(cardDigits)s.{{/strong}}', {
							components: { strong: <strong /> },
							args: { cardDigits: paymentMethod },
						} ) }
					</p>
					<p><a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">{ __( 'Manage cards' ) }</a></p>
				</Notice>
			);
		}

		if ( numPaymentMethods > 0 ) {
			return (
				<Notice isCompact={ true } showDismiss={ false } className="shipping-label__payment inline">
					<p>{ __( 'To purchase shipping labels, you will first need to select a credit card.' ) }</p>
					<p><a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">{ __( 'Select a credit card' ) }</a></p>
				</Notice>
			);
		}

		return (
			<Notice isCompact showDismiss={ false } className="shipping-label__payment inline">
				<p>{ __( 'To purchase shipping labels, you will first need to add a credit card.' ) }</p>
				<p><a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">{ __( 'Add a credit card' ) }</a></p>
			</Notice>
		);
	};

	renderLabelButton = () => {
		return (
			<Button className="shipping-label__new-label-button" onClick={ this.props.labelActions.openPrintingFlow } >
				{ __( 'Create new label' ) }
			</Button>
		);
	};

	renderPurchaseLabelFlow = () => {
		const paymentMethod = this.props.shippingLabel.paymentMethod;

		return (
			<div className="shipping-label__item" >
				<PurchaseDialog
					{ ...this.props.shippingLabel }
					{ ...this.props } />
				{ this.renderPaymentInfo( paymentMethod ) }
				{ paymentMethod && this.renderLabelButton() }
			</div>
		);
	};

	renderRefundLink = ( label ) => {
		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if ( ( label.used_date && label.used_date < today.getTime() ) || ( label.created_date && label.created_date < thirtyDaysAgo ) ) {
			return null;
		}

		const openRefundDialog = ( e ) => {
			e.preventDefault();
			this.props.labelActions.openRefundDialog( label.label_id );
		};

		return (
			<span>
				<RefundDialog
					refundDialog={ this.props.shippingLabel.refundDialog }
					{ ...this.props.shippingLabel }
					{ ...this.props }
					{ ...label } />
				<a href="#" onClick={ openRefundDialog } >
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

		const openReprintDialog = ( e ) => {
			e.preventDefault();
			this.props.labelActions.openReprintDialog( label.label_id );
		};

		return (
			<span>
				<ReprintDialog
					reprintDialog={ this.props.shippingLabel.reprintDialog }
					{ ...this.props.shippingLabel }
					{ ...this.props }
					{ ...label } />
				<a href="#" onClick={ openReprintDialog } >
					<Gridicon icon="print" size={ 12 } />{ __( 'Reprint' ) }
				</a>
			</span>
		);
	};

	renderLabelDetails = ( label, labelNum ) => {
		if ( ! label.package_name || ! label.product_names ) {
			return null;
		}

		const tooltipAnchor = (
			<span className="shipping-label__item-detail">
				{ __( 'Label #%(labelNum)s', { args: { labelNum } } ) }
			</span>
		);
		return (
			<InfoTooltip anchor={ tooltipAnchor }>
				<h3>{ label.package_name }</h3>
				<p>{ label.service_name }</p>
				<ul>
					{ label.product_names.map( ( productName, productIdx ) => <li key={ productIdx }>{ productName }</li> ) }
				</ul>
			</InfoTooltip>
		);
	};

	renderLabel = ( label, index, labels ) => {
		const purchased = timeAgo( label.created );

		return (
			<div key={ label.label_id } className="shipping-label__item" >
				<p className="shipping-label__item-created">
					{ __( '{{labelDetails/}} purchased {{purchasedAt/}}', {
						components: {
							labelDetails: this.renderLabelDetails( label, labels.length - index, index ),
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
	};

	renderLabels = () => {
		return this.props.shippingLabel.labels.map( this.renderLabel );
	};

	renderLoading() {
		return (
			<div>
				<QueryLabels />
				<LoadingSpinner />
			</div>
		);
	}

	render() {
		if ( ! this.props.loaded ) {
			return this.renderLoading();
		}

		return (
			<div className="shipping-label__container">
				<QueryLabels />
				<GlobalNotices id="notices" notices={ notices.list } />
				{ this.renderPurchaseLabelFlow() }
				{ this.props.shippingLabel.labels.length ? this.renderLabels() : null }
			</div>
		);
	}
}

ShippingLabelRootView.propTypes = {
	storeOptions: PropTypes.object.isRequired,
	shippingLabel: PropTypes.object.isRequired,
};

function mapStateToProps( state ) {
	const shippingLabel = state.shippingLabel;
	const loaded = shippingLabel.loaded;
	const storeOptions = loaded ? shippingLabel.storeOptions : {};

	return {
		shippingLabel,
		loaded,
		storeOptions,
		needToFetchLabelStatus: loaded && ! shippingLabel.refreshedLabelStatus,
		errors: loaded && getFormErrors( state, storeOptions ),
		canPurchase: loaded && canPurchase( state, storeOptions ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		labelActions: bindActionCreators( ShippingLabelActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( ShippingLabelRootView );
