/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CommentButton = require( 'components/comment-button' );

var AddNewButtons = React.createClass( {
	displayName: 'CommentButton',

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/comment-button">Comment Buttons</a>
				</h2>
				<CommentButton commentCount={ 10 } />
			</div>
		);
	}
} );

module.exports = AddNewButtons;
