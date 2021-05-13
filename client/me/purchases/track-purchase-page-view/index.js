/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export class TrackPurchasePageView extends Component {
	static propTypes = {
		purchaseId: PropTypes.number.isRequired,
		productSlug: PropTypes.string,
		recordTracksEvent: PropTypes.func.isRequired,
		eventName: PropTypes.string.isRequired,
	};

	track() {
		if ( this.props.productSlug && this.props.eventName ) {
			this.props.recordTracksEvent( this.props.eventName, {
				product_slug: this.props.productSlug,
			} );
		}
	}

	componentDidMount() {
		this.track();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.eventName !== prevProps.eventName ||
			this.props.productSlug !== prevProps.productSlug
		) {
			this.track();
		}
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
