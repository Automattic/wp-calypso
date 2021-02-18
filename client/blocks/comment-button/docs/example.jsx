/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CommentButton from 'calypso/blocks/comment-button';
import { Card } from '@automattic/components';

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
