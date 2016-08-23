/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { PureCommentButton } from 'blocks/comment-button';
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
					<PureCommentButton postId={ 1 } siteId={ 1 } commentCount={ 0 } />
				</Card>
				<Card compact>
					<PureCommentButton postId={ 1 } siteId={ 1 } commentCount={ 42 } />
				</Card>
				<Card compact>
					<PureCommentButton
						postId={ 1 }
						siteId={ 1 }
						commentCount={ 42 }
						showLabel={ false } />
				</Card>
			</div>
		);
	}
} );
