/**
 * External dependencies
 */
import { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestLists } from './actions';
import { isRequestingLists } from './selectors';

class QueryMailChimpLists extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		requestLists: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.isRequesting && props.siteId ) {
			props.requestLists( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isRequesting: isRequestingLists( state, siteId ),
	} ),
	{ requestLists }
)( QueryMailChimpLists );
