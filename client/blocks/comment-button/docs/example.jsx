/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { CommentButton } from 'blocks/comment-button';
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
					<CommentButton postId={ 1 } siteId={ 1 } count={ 0 } />
				</Card>
				<Card compact>
					<CommentButton postId={ 1 } siteId={ 1 } count={ 42 } />
				</Card>
				<Card compact>
					<CommentButton
						postId={ 1 }
						siteId={ 1 }
						count={ 42 }
						showLabel={ false } />
				</Card>
			</div>
		);
	}
} );
