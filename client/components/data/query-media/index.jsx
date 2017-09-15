/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { Component } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestMedia, requestMediaItem } from 'state/media/actions';

/**
 * Module variables
 */
const mapDispatchToProps = {
	requestMedia,
	requestMediaItem,
};

class QueryMedia extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		query: PropTypes.object,
		mediaId: PropTypes.number,
		request: PropTypes.func
	};

	static defaultProps = {
		request: () => {}
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.siteId === prevProps.siteId &&
				this.props.mediaId === prevProps.mediaId &&
				shallowEqual( this.props.query, prevProps.query ) ) {
			return;
		}

		this.request();
	}

	request() {
		const { siteId, mediaId, query } = this.props;
		const single = !! mediaId;
		if ( single ) {
			this.props.requestMediaItem( siteId, mediaId );
		} else {
			this.props.requestMedia( siteId, query );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, mapDispatchToProps )( QueryMedia );
