/**
 * Exeternal Dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classnames = require( 'classnames' );

/**
 * Internal Dependencies
 */
var LikeIcons = require( './icons' );

var LikeButton = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		liked: React.PropTypes.bool,
		showCount: React.PropTypes.bool,
		likeCount: React.PropTypes.number,
		showLabel: React.PropTypes.bool,
		tagName: React.PropTypes.string,
		onLikeToggle: React.PropTypes.func,
		likedLabel: React.PropTypes.string,
		isMini: React.PropTypes.bool,
		animateLike: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			liked: false,
			showCount: false,
			likeCount: 0,
			showLabel: true,
			isMini: false,
			animateLike: true
		};
	},

	toggleLiked: function( event ) {
		if ( event ) {
			event.preventDefault();
		}
		if ( this.props.onLikeToggle ) {
			this.props.onLikeToggle( ! this.props.liked );
		}
	},

	render: function() {
		var containerClasses = {
				'like-button': true,
				'ignore-click': true,
				'is-mini': this.props.isMini,
				'is-animated': this.props.animateLike
			},
			likeLabel = this.translate( 'Like', { comment: 'Label for a button to "like" a post.' } ),
			likeCount = this.props.likeCount,
			containerTag = this.props.tagName || 'li',
			labelElement,
			iconSize = 24;

		if ( this.props.liked ) {
			containerClasses[ 'is-liked' ] = true;

			if ( this.props.likedLabel ) {
				likeLabel = this.props.likedLabel;
			} else {
				likeLabel = this.translate( 'Liked', { comment: 'Displayed when a person "likes" a post.' } );
			}
		}

		// Override the label with a counter
		if ( likeCount > 0 || this.props.showCount ) {
			likeLabel = this.translate( 'Like', 'Likes', {
				count: likeCount,
				comment: 'Displayed when a person "likes" a post.'
			} );
		}

		if ( this.props.isMini ) {
			iconSize = 18;
		}

		containerClasses = classnames( containerClasses );

		if ( likeCount === 0 && ! this.props.showCount ) {
			likeCount = '';
		} else {
			likeCount = likeCount + ' ';
		}

		labelElement = ( <span className="like-button__label">
			<span className="like-button__label-count">{ likeCount }</span>
			{ this.props.showLabel && <span className="like-button__label-status">{ likeLabel }</span> }
		</span> );

		return (
		React.createElement(
			containerTag,
			{
				className: containerClasses,
				onTouchTap: this.toggleLiked
			},
			<LikeIcons size={ iconSize } />, labelElement
		)
		);
	}
} );

module.exports = LikeButton;
