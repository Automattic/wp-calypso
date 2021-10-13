import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import { like, unlike } from 'calypso/state/posts/likes/actions';
import { getPostLikeCount } from 'calypso/state/posts/selectors/get-post-like-count';
import { isLikedPost } from 'calypso/state/posts/selectors/is-liked-post';
import LikeButton from './button';

const noop = () => {};

class LikeButtonContainer extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		showZeroCount: PropTypes.bool,
		tagName: PropTypes.string,
		onLikeToggle: PropTypes.func,
		found: PropTypes.number,
		iLike: PropTypes.bool,
		likeSource: PropTypes.string,
	};

	static defaultProps = {
		onLikeToggle: noop,
	};

	handleLikeToggle = ( liked ) => {
		const toggler = liked ? this.props.like : this.props.unlike;
		toggler( this.props.siteId, this.props.postId, { source: this.props.likeSource } );

		this.props.onLikeToggle( liked );
	};

	render() {
		const props = omit( this.props, [
			'siteId',
			'postId',
			'likeCount',
			'iLike',
			'like',
			'unlike',
		] );
		return (
			<Fragment>
				<QueryPostLikes siteId={ this.props.siteId } postId={ this.props.postId } />
				<LikeButton
					{ ...props }
					likeCount={ this.props.likeCount }
					liked={ this.props.iLike }
					animateLike={ true }
					onLikeToggle={ this.handleLikeToggle }
				/>
			</Fragment>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		return {
			likeCount: getPostLikeCount( state, siteId, postId ),
			iLike: isLikedPost( state, siteId, postId ),
		};
	},
	{ like, unlike },
	null,
	{ forwardRef: true }
)( LikeButtonContainer );
