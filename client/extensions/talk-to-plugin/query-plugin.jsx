/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteOptions } from './state/selectors';
import { fetchOptions } from './state/actions';

class QueryPlugin extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		requestingOptions: PropTypes.bool,
		fetchOptions: PropTypes.func
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingOptions ) {
			return;
		}

		props.fetchOptions( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingOptions: isRequestingSiteOptions( state, ownProps.siteId )
		};
	},
	{ fetchOptions }
)( QueryPlugin );
