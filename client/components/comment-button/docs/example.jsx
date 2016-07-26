/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'components/comment-button';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'CommentButtonExample',

	render() {
		return(
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/comment-button">Comment Buttons</a>
				</h2>
				<Card>
					<span>No comments:</span>
					<CommentButton commentCount={ 0 } />
				</Card>
				<Card>
					<span>With comments:</span>
					<CommentButton commentCount={ 42 } />
				</Card>
			</div>
		);
	}
} );
