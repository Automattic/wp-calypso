/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getByPurchaseId } from 'state/purchases/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class TrackPurchasePageView extends Component {
	static propTypes = {
		purchaseId: PropTypes.number.isRequired,
		productSlug: PropTypes.string,
		recordTracksEvent: PropTypes.func.isRequired,
		eventName: PropTypes.string.isRequired,
	};

	hasTracked = false;

	trackOnce() {
		if ( ! this.hasTracked && ( this.props.productSlug && this.props.eventName ) ) {
			this.hasTracked = true;
			this.props.recordTracksEvent( this.props.eventName, {
				product_slug: this.props.productSlug,
			} );
		}
	}

	componentDidMount() {
		this.trackOnce();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.eventName !== prevProps.eventName ||
			this.props.productSlug !== prevProps.productSlug
		) {
			this.hasTracked = false;
		}

		this.trackOnce();
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { purchaseId } ) => {
		const purchase = getByPurchaseId( state, purchaseId );
		return {
			productSlug: purchase ? purchase.productSlug : null,
		};
	},
	{ recordTracksEvent }
)( TrackPurchasePageView );
