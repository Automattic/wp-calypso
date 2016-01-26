/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );
/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

var CommentButton = React.createClass( {

	propTypes: {
		onClick: React.PropTypes.func,
		tagName: React.PropTypes.string,
		commentCount: React.PropTypes.number.isRequired
	},

	getDefaultProps: function() {
		return {
			onClick: noop,
			tagName: 'li',
			size: 24
		};
	},

	onClick: function( event ) {
		event.preventDefault();
	},

	onTap: function() {
		this.props.onClick();
	},

	render: function() {
		var containerTag = this.props.tagName;

		var labelElement = ( <span className="comment-button__label">{ this.props.commentCount }</span> );

		return React.createElement(
			containerTag, {
				className: 'comment-button',
				onTouchTap: this.onTap,
				onClick: this.onClick
			},
			<Gridicon icon="comment" size={ this.props.size } className="comment-button__icon" />, labelElement
		);
	}
} );

module.exports = CommentButton;
