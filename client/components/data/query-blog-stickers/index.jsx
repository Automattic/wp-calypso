/** @format */
/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { listBlogStickers } from 'state/sites/blog-stickers/actions';

class QueryBlogStickers extends Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
	};

	componentWillMount() {
		this.props.listBlogStickers( this.props.blogId );
	}

	componentWillReceiveProps( nextProps ) {
		this.props.listBlogStickers( nextProps.blogId );
	}

	render() {
		return null;
	}
}

export default connect( null, { listBlogStickers } )( QueryBlogStickers );
