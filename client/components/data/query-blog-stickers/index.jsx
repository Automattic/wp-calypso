/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getBlogStickers from 'state/selectors/get-blog-stickers';
import { listBlogStickers } from 'state/sites/blog-stickers/actions';

class QueryBlogStickers extends Component {
	static propTypes = {
		blogId: PropTypes.number.isRequired,
		stickersLoaded: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		if ( ! this.props.stickersLoaded ) {
			this.props.listBlogStickers( this.props.blogId );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.blogId !== this.props.blogId && ! this.props.stickersLoaded ) {
			this.props.listBlogStickers( this.props.blogId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { blogId } ) => ( {
		stickersLoaded: !! getBlogStickers( state, blogId ),
	} ),
	{ listBlogStickers }
)( QueryBlogStickers );
