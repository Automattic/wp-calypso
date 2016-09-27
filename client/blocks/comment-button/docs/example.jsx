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
		return (
			<div>
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
