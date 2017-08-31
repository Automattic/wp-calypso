/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { repeat } from 'lodash';

/**
 * Internal dependencies
 */
import PostComment from 'blocks/comments/post-comment';
import { POST_COMMENT_DISPLAY_TYPES } from 'state/comments/constants';
import Card from 'components/card';

const mockComment = {
	author: {
		avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		email: 'test@test.com',
		ID: 12345678,
		ip: '127.0.0.1',
		isBlocked: false,
		name: 'Test User',
		nice_name: 'testuser',
		URL: 'http://discover.wordpress.com',
	},
	content:
		'Turnip greens yarrow ricebean rutabaga endive cauliflower sea lettuce kohlrabi amaranth water spinach avocado daikon napa cabbage asparagus winter purslane kale. Celery potato scallion desert raisin horseradish spinach carrot soko. Lotus root water spinach fennel kombu maize bamboo shoot green bean swiss chard seakale pumpkin onion chickpea gram corn pea. Brussels sprout coriander water chestnut gourd swiss chard wakame kohlrabi beetroot carrot watercress. Corn amaranth salsify bunya nuts nori azuki bean chickweed potato bell pepper artichoke.',
	date: '2017-05-12 16:00:00',
	ID: 12345678,
	i_like: false,
	post: {
		author: { name: 'Test User' },
		title: 'Test Post',
		link: 'http://discover.wordpress.com',
	},
	replied: true,
	status: 'approved',
	URL: 'http://discover.wordpress.com',
};

const mockShortComment = {
	...mockComment,
	content: 'Just this',
};

const mockMultipleShortLineComment = {
	...mockComment,
	content: 'A comment<br>with<br>many lines<br>that will<br>overflow',
};

const mockComments = [
	{ ...mockComment, ID: 0 },
	{ ...mockComment, ID: 1, content: repeat( mockComment.content, 5 ) },
	{ ...mockComment, ID: 2, content: repeat( mockComment.content, 5 ) },
	{ ...mockShortComment, ID: 3 },
	{ ...mockMultipleShortLineComment, ID: 4 },
];

const commentsTree = {
	'0': {
		children: [ 1 ],
		data: mockComments[ 0 ],
	},
	'1': {
		children: [],
		data: mockComments[ 1 ],
	},
	'2': {
		children: [],
		data: mockComments[ 2 ],
	},
	'3': {
		children: [ 1 ],
		data: mockComments[ 3 ],
	},
	'4': {
		children: [ 1 ],
		data: mockComments[ 4 ],
	},
};

export default class PostCommentExample extends React.Component {
	static displayName = 'PostCommentExample';

	render() {
		return (
			<div>
				<Card compact>
					<PostComment
						showNestingReplyArrow
						commentId={ 0 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.singleLine }
					/>
					<PostComment
						showNestingReplyArrow
						commentId={ 2 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.excerpt }
					/>
					<PostComment
						showNestingReplyArrow
						commentId={ 3 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.excerpt }
					/>
					<PostComment
						showNestingReplyArrow
						commentId={ 3 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.singleLine }
					/>
					<PostComment
						showNestingReplyArrow
						commentId={ 4 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.excerpt }
					/>
					<PostComment
						showNestingReplyArrow
						commentId={ 4 }
						depth={ 0 }
						commentsTree={ commentsTree }
						displayType={ POST_COMMENT_DISPLAY_TYPES.singleLine }
					/>
				</Card>
			</div>
		);
	}
}
