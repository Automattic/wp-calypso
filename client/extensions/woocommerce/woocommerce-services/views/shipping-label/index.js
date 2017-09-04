/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate as __ } from 'i18n-calypso';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import LoadingSpinner from 'components/loading-spinner';
import PurchaseDialog from './components/label-purchase-modal';
import QueryLabels from 'components/query-labels';
import LabelItem from './components/label-item';
import { fetchLabelsStatus, openPrintingFlow } from './state/actions';
import notices from 'notices';
import GlobalNotices from 'components/global-notices';
import Notice from 'components/notice';

class ShippingLabelRootView extends Component {
	componentWillMount() {
		if ( this.props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus();
		}
	}

	componentWillReceiveProps( props ) {
		if ( props.needToFetchLabelStatus ) {
			this.props.fetchLabelsStatus();
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
				<PurchaseDialog />
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
				{ this.props.labels.length ? this.renderLabels() : null }
			</div>
		);
	}
}

ShippingLabelRootView.propTypes = {
	loaded: PropTypes.bool.isRequired,
	needToFetchLabelStatus: PropTypes.bool.isRequired,
	numPaymentMethods: PropTypes.number.isRequired,
	paymentMethod: PropTypes.number.isRequired,
	labels: PropTypes.array.isRequired,
	fetchLabelsStatus: PropTypes.func.isRequired,
	openPrintingFlow: PropTypes.func.isRequired,
};

const mapStateToProps = ( state ) => {
	const loaded = state.shippingLabel.loaded;
	return {
		loaded,
		needToFetchLabelStatus: loaded && ! state.shippingLabel.refreshedLabelStatus,
		numPaymentMethods: state.shippingLabel.numPaymentMethods,
		paymentMethod: state.shippingLabel.paymentMethod,
		labels: state.shippingLabel.labels,
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { fetchLabelsStatus, openPrintingFlow }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( ShippingLabelRootView );
