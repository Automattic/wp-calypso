/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import LoadingSpinner from 'components/spinner';
import PurchaseDialog from './label-purchase-modal';
import QueryLabels from 'woocommerce/woocommerce-services/components/query-labels';
import LabelItem from './label-item';
import { fetchLabelsStatus, openPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import notices from 'notices';
import GlobalNotices from 'components/global-notices';
import Notice from 'components/notice';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class ShippingLabelRootView extends Component {
	componentWillMount() {
		if ( this.props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus( this.props.siteId, this.props.orderId );
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus( props.siteId, props.orderId );
		}
	}

	renderPaymentInfo = () => {
		const { numPaymentMethods, paymentMethod } = this.props;

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
			<Button className="shipping-label__new-label-button" onClick={ this.props.openPrintingFlow } >
				{ __( 'Create new label' ) }
			</Button>
		);
	};

	renderPurchaseLabelFlow = () => {
		return (
			<div className="shipping-label__item" >
				<PurchaseDialog orderId={ this.props.orderId } siteId={ this.props.siteId } />
				{ this.renderPaymentInfo() }
				{ this.props.paymentMethod && this.renderLabelButton() }
			</div>
		);
	};

	renderLabels = () => {
		//filter by blacklist (rather than just checking for PURCHASED) to handle legacy labels without the status field
		const labelsToRender = filter( this.props.labels,
			( label ) => 'PURCHASE_IN_PROGRESS' !== label.status && 'PURCHASE_ERROR' !== label.status );

		return labelsToRender.map( ( label, index ) => {
			return (
				<LabelItem
					key={ label.label_id }
					label={ label }
					labelNum={ labelsToRender.length - index }
				/>
			);
		} );
	};

	renderLoading() {
		return (
			<div>
				<QueryLabels orderId={ this.props.orderId } />
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
				<QueryLabels orderId={ this.props.orderId } />
				<GlobalNotices id="notices" notices={ notices.list } />
				{ this.renderPurchaseLabelFlow() }
				{ this.props.labels.length ? this.renderLabels() : null }
			</div>
		);
	}
}

ShippingLabelRootView.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
};

const mapStateToProps = ( state, { orderId } ) => {
	const loaded = isLoaded( state, orderId );
	const shippingLabel = getShippingLabel( state, orderId );
	return {
		loaded,
		needToFetchLabelStatus: loaded && ! shippingLabel.refreshedLabelStatus,
		numPaymentMethods: loaded && shippingLabel.numPaymentMethods,
		paymentMethod: loaded && shippingLabel.paymentMethod,
		labels: loaded && shippingLabel.labels,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { fetchLabelsStatus, openPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( ShippingLabelRootView );
