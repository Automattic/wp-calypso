/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { omit, noop } from 'lodash';

/**
 * Internal dependencies
 */
import smartSetState from 'lib/react-smart-set-state';
import { likePost, unlikePost } from 'lib/like-store/actions';
import LikeButton from './button';
import LikeStore from 'lib/like-store/like-store';

class LikeButtonContainer extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number.isRequired,
		showZeroCount: PropTypes.bool,
		tagName: PropTypes.string,
		onLikeToggle: PropTypes.func,
	};

	static defaultProps = {
		onLikeToggle: noop,
	};

	constructor( props ) {
		super( props );

		this.handleLikeToggle = this.handleLikeToggle.bind( this );

		this.state = this.getStateFromStores( props );
		this.smartSetState = smartSetState;
	}

	getStateFromStores( props = this.props, animateLike = true ) {
		return {
			likeCount: LikeStore.getLikeCountForPost( props.siteId, props.postId ) || 0,
			iLike: LikeStore.isPostLikedByCurrentUser( props.siteId, props.postId ),
			animateLike: animateLike,
		};
	}

	updateState = ( newState = this.getStateFromStores() ) => {
		this.smartSetState( newState );
	};

	componentWillReceiveProps( nextProps ) {
		this.updateState( this.getStateFromStores( nextProps ) );
	}
	componentDidMount() {
		LikeStore.on( 'change', this.updateState );
	}

	componentWillUnmount() {
		LikeStore.off( 'change', this.updateState );
	}

	handleLikeToggle( liked ) {
		const toggler = liked ? likePost : unlikePost;
		toggler( this.props.siteId, this.props.postId );

		this.props.onLikeToggle( liked );
	}

	render() {
		const props = omit( this.props, [ 'siteId' ] );
		return (
			<LikeButton
				{ ...props }
				likeCount={ this.state.likeCount }
				liked={ this.state.iLike }
				animateLike={ this.state.animateLike }
				onLikeToggle={ this.handleLikeToggle }
			/>
		);
	}
}

export default LikeButtonContainer;
