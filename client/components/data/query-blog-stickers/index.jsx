import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { listBlogStickers } from 'calypso/state/blog-stickers/actions';
import getBlogStickers from 'calypso/state/selectors/get-blog-stickers';

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
