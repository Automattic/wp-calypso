/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debug from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingMediaItems } from 'state/media/selectors';
import { requestMediaItems } from 'state/media/actions';

/**
 * Module variables
 */
const log = debug( 'calypso:query-media' );

class QueryMedia extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.postId === nextProps.postId &&
				shallowEqual( this.props.query, nextProps.query ) ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.isRequestingMedia ) {
			log( 'Request post list for site %d using query %o', props.siteId, props.query );
			props.requestMediaItems( props.siteId, props.query );
		}
	}

	render() {
		return null;
	}
}

QueryMedia.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	query: PropTypes.object,
	isRequestingMediaItems: PropTypes.bool,
	requestMediaItems: PropTypes.func
};

QueryMedia.defaultProps = {
	requestMediaItems: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, query } = ownProps;

		return {
			isRequestingMediaItems: isRequestingMediaItems( state, siteId, query )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			requestMediaItems
		}, dispatch );
	}
)( QueryMedia );
