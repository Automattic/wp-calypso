/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Spinner from 'components/spinner';
import PurchaseDialog from './label-purchase-modal';
import QueryLabels from 'woocommerce/woocommerce-services/components/query-labels';
import { fetchLabelsStatus, openPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import Notice from 'components/notice';
import { isLoaded, getShippingLabel } from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class ShippingLabelRootView extends Component {
	componentWillMount() {
		if ( this.props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus( this.props.orderId, this.props.siteId );
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus( props.orderId, props.siteId );
		}
	}

	renderPaymentInfo = () => {
		const { numPaymentMethods, paymentMethod, translate } = this.props;

		if ( numPaymentMethods > 0 && paymentMethod ) {
			return (
				<Notice isCompact showDismiss={ false } className="shipping-label__payment inline">
					<p>
						{ translate( 'Labels will be purchased using card ending: {{strong}}%(cardDigits)s.{{/strong}}', {
							components: { strong: <strong /> },
							args: { cardDigits: paymentMethod },
						} ) }
					</p>
					<p><a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">{ translate( 'Manage cards' ) }</a></p>
				</Notice>
			);
		}

		if ( numPaymentMethods > 0 ) {
			return (
				<Notice isCompact={ true } showDismiss={ false } className="shipping-label__payment inline">
					<p>{ translate( 'To purchase shipping labels, you will first need to select a credit card.' ) }</p>
					<p>
						<a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">
							{ translate( 'Select a credit card' ) }
						</a>
					</p>
				</Notice>
			);
		}

		return (
			<Notice isCompact showDismiss={ false } className="shipping-label__payment inline">
				<p>{ translate( 'To purchase shipping labels, you will first need to add a credit card.' ) }</p>
				<p><a href="admin.php?page=wc-settings&tab=shipping&section=label-settings">{ translate( 'Add a credit card' ) }</a></p>
			</Notice>
		);
	};

	renderLabelButton = () => {
		const onNewLabelClick = () => this.props.openPrintingFlow( this.props.orderId, this.props.siteId );
		return (
			<Button className="shipping-label__new-label-button" onClick={ onNewLabelClick } >
				{ this.props.translate( 'Create new label' ) }
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

	renderLoading() {
		return (
			<div>
				<QueryLabels orderId={ this.props.orderId } />
				<div className="shipping-label__loading-spinner">
					<Spinner />
				</div>
			</div>
		);
	}

	render() {
		if ( ! this.props.loaded ) {
			return this.renderLoading();
		}

		return (
			<div className="shipping-label">
				<QueryLabels orderId={ this.props.orderId } />
				{ this.renderPurchaseLabelFlow() }
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
		siteId: getSelectedSiteId( state ),
		loaded,
		needToFetchLabelStatus: loaded && ! shippingLabel.refreshedLabelStatus,
		numPaymentMethods: loaded && shippingLabel.numPaymentMethods,
		paymentMethod: loaded && shippingLabel.paymentMethod,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { fetchLabelsStatus, openPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ShippingLabelRootView ) );
