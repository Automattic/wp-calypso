/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchLabelsData } from '../../apps/shipping-label/state/actions';

class QueryLabels extends Component {
	fetch() {
		this.props.fetchLabelsData();
	}

	componentWillMount() {
		const { loaded, isFetching, error } = this.props;
		if ( ! loaded && ! isFetching && ! error ) {
			this.fetch();
		}
	}

	componentWillReceiveProps( props ) {
		const { loaded, isFetching, error } = props;
		if ( ! loaded && ! isFetching && ! error ) {
			this.fetch();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => ( {
		loaded: state.shippingLabel.loaded,
		isFetching: state.shippingLabel.isFetching,
		error: state.shippingLabel.error,
	} ),
	( dispatch ) => bindActionCreators( {
		fetchLabelsData,
	}, dispatch )
)( QueryLabels );
