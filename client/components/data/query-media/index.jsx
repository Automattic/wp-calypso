/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { requestMedia } from 'state/media/actions';

class QueryMedia extends Component {
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

QueryMedia.propTypes = {
	siteId: PropTypes.number.isRequired,
	query: PropTypes.object,
	request: PropTypes.func
};

QueryMedia.defaultProps = {
	request: () => {}
};

export default connect(
	null,
	( dispatch ) => {
		return bindActionCreators( {
			request: requestMedia
		}, dispatch );
	}
)( QueryMedia );
