/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestMedia } from 'state/media/actions';

/**
 * Module variables
 */
const mapDispatchToProps = {
	request: requestMedia
};

class QueryMedia extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		query: PropTypes.object,
		request: PropTypes.func
	};

	static defaultProps = {
		request: () => {}
	};

	componentWillMount() {
		this.props.request( this.props.siteId, this.props.query );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				shallowEqual( this.props.query, nextProps.query ) ) {
			return;
		}

		nextProps.request( nextProps.siteId, nextProps.query );
	}

	render() {
		return null;
	}
}

export default connect( null, mapDispatchToProps )( QueryMedia );
