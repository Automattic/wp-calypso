/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'blocks/comment-button';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'CommentButtonExample',

	render() {
		return(
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/blocks/comment-button">Comment Buttons</a>
				</h2>
				<Card compact>
					<CommentButton commentCount={ 0 } />
				</Card>
				<Card compact>
					<CommentButton commentCount={ 42 } />
				</Card>
			</div>
		);
	}
} );
