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
import TrackingLink from './tracking-link';
import { openRefundDialog, openReprintDialog } from 'woocommerce/woocommerce-services/state/shipping-label/actions';

class LabelItem extends Component {
	renderRefund = ( label ) => {
		const { orderId, siteId, translate } = this.props;

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
			<span>
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<a href="#" onClick={ openDialog } >{ translate( 'Request refund' ) }</a>
			</span>
		);
	};

	renderReprint = ( label ) => {
		const todayTime = new Date().getTime();
		if ( ( label.usedDate && label.usedDate < todayTime ) ||
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
		const { translate } = this.props;
		return (
			<span className="shipping-label__item-detail">
				{ translate( 'Label #%(labelIndex)s', { args: { labelIndex: label.labelIndex + 1 } } ) }
			</span>
		);
	};

	render() {
		const { label, translate } = this.props;

		return (
			<div key={ label.labelId } className="shipping-label__item" >
				<p className="shipping-label__item-created">
					{ translate( '{{labelDetails/}} purchased', {
						components: {
							labelDetails: this.renderLabelDetails( label ),
						}
					} ) }
				</p>
				<p className="shipping-label__item-tracking">
					{ translate( 'Tracking #: {{trackingLink/}}', { components: { trackingLink: <TrackingLink { ...label } /> } } ) }
				</p>
				{ label.showDetails &&
					<p className="shipping-label__item-actions">
						{ this.renderRefund( label ) }
						{ this.renderReprint( label ) }
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

export default connect( null, mapDispatchToProps )( localize( LabelItem ) );
