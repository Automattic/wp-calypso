import { flowRight, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withPostLikeActions, withPostLikes } from 'calypso/components/data/post-likes';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
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
		icon: PropTypes.object,
	};

	static defaultProps = {
		onLikeToggle: noop,
	};

	handleLikeToggle = ( liked ) => {
		if ( ! this.props.isLoggedIn ) {
			return this.props.registerLastActionRequiresLogin( {
				type: liked ? 'like' : 'unlike',
				siteId: this.props.siteId,
				postId: this.props.postId,
			} );
		}

		if ( this.props.isLikePending || this.props.isUnlikePending ) {
			return;
		}

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
				<LikeButton
					{ ...props }
					likeCount={ this.props.likeCount }
					liked={ this.props.iLike }
					animateLike
					onLikeToggle={ this.handleLikeToggle }
					icon={ this.props.icon }
				/>
			</Fragment>
		);
	}
}

export default flowRight(
	connect(
		( state ) => {
			return {
				isLoggedIn: isUserLoggedIn( state ),
			};
		},
		{ registerLastActionRequiresLogin },
		null,
		{ forwardRef: true }
	),
	withPostLikes,
	withPostLikeActions
)( LikeButtonContainer );
