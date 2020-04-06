/**
 * External dependencies
 */
import { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSettings } from './actions';
import { isRequestingSettings } from './selectors';

class QueryMailChimpSettings extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		requestSettings: PropTypes.func.isRequired,
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
			props.requestSettings( props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isRequesting: isRequestingSettings( state, siteId ),
	} ),
	{ requestSettings }
)( QueryMailChimpSettings );
