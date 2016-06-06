/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'components/comment-button';
import Card from 'components/card';
import DocsExample from 'components/docs-example';

export default React.createClass( {
	displayName: 'CommentButtonExample',

	render() {
		return(
			<DocsExample
				title="Comment Buttons"
				url="/devdocs/design/comment-button"
			>
				<Card>
					<span>No comments:</span>
					<CommentButton commentCount={ 0 } />
				</Card>
				<Card>
					<span>With comments:</span>
					<CommentButton commentCount={ 42 } />
				</Card>
			</DocsExample>
		);
	}
} );
