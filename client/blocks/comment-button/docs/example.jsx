import { Card } from '@automattic/components';
import { Component } from 'react';
import CommentButton from 'calypso/blocks/comment-button';

export default class CommentButtonExample extends Component {
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
