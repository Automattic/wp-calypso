import { Card } from '@automattic/components';
import React from 'react';
import CommentButton from 'calypso/blocks/comment-button';

export default class CommentButtonExample extends React.Component {
	static displayName = 'CommentButtonExample';

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
}
