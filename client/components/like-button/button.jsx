/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import LikeIcons from './icons';

const LikeButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		liked: React.PropTypes.bool,
		showZeroCount: React.PropTypes.bool,
		likeCount: React.PropTypes.number,
		showLabel: React.PropTypes.bool,
		tagName: React.PropTypes.string,
		onLikeToggle: React.PropTypes.func,
		likedLabel: React.PropTypes.string,
		isMini: React.PropTypes.bool,
		animateLike: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			liked: false,
			showZeroCount: false,
			likeCount: 0,
			showLabel: true,
			isMini: false,
			animateLike: true
		};
	},

	toggleLiked( event ) {
		if ( event ) {
			event.preventDefault();
		}
		if ( this.props.onLikeToggle ) {
			this.props.onLikeToggle( ! this.props.liked );
		}
	},

	render() {
		const showLikeCount = this.props.likeCount > 0 || this.props.showZeroCount;
		const likeCount = this.props.likeCount;
		const containerTag = this.props.tagName || 'li';
		const containerClasses = {
			'like-button': true,
			'ignore-click': true,
			'is-mini': this.props.isMini,
			'is-animated': this.props.animateLike,
			'has-count': showLikeCount,
			'has-label': this.props.showLabel
		};
		let likeLabel = this.translate( 'Like', { comment: 'Label for a button to "like" a post.' } );
		let iconSize = 24;

		if ( this.props.liked ) {
			containerClasses[ 'is-liked' ] = true;

			if ( this.props.likedLabel ) {
				likeLabel = this.props.likedLabel;
			} else {
				likeLabel = this.translate( 'Liked', { comment: 'Displayed when a person "likes" a post.' } );
			}
		}

		// Override the label with a counter
		if ( showLikeCount ) {
			likeLabel = this.translate( 'Like', 'Likes', {
				count: likeCount,
				comment: 'Displayed when a person "likes" a post.'
			} );
		}

		if ( this.props.isMini ) {
			iconSize = 18;
		}

		const labelElement = ( <span className="like-button__label">
			<span className="like-button__label-count">{ showLikeCount ? likeCount : '' }</span>
			{ this.props.showLabel && <span className="like-button__label-status">{ likeLabel }</span> }
		</span> );

		return (
			React.createElement(
				containerTag,
				{
					className: classNames( containerClasses ),
					onTouchTap: this.toggleLiked
				},
				<LikeIcons size={ iconSize } />, labelElement
			)
		);
	}
} );

export default LikeButton;
