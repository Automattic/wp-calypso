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
import { isRequestingMedia } from 'state/selectors';
import { requestMedia } from 'state/media/actions';

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
				shallowEqual( this.props.query, nextProps.query ) ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( ! props.requesting ) {
			log( 'Request media for site %d using query %o', props.siteId, props.query );
			props.request( props.siteId, props.query );
		}
	}

	render() {
		return null;
	}
}

QueryMedia.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	requesting: PropTypes.bool,
	request: PropTypes.func
};

QueryMedia.defaultProps = {
	request: () => {}
};

export default connect(
	( state, ownProps ) => {
		const { siteId, query } = ownProps;

		return {
			requesting: isRequestingMedia( state, siteId, query )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			request: requestMedia
		}, dispatch );
	}
)( QueryMedia );
