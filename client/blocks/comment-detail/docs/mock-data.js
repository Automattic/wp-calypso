export const mockComments = [
	{ commentId: 1, siteId: 3584907 },
	{ commentId: 2, siteId: 3584907 },
	{ commentId: 3, siteId: 3584907 },
	{ commentId: 4, siteId: 3584907 },
	{ commentId: 5, siteId: 3584907 },
];

export const mockComment = {
	content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
	date: '2017-05-12 16:00:00',
	id: 12345678,
	isApproved: true,
	isLiked: false,
	isSpam: false,
	isTrash: false,
	replied: true,

	author: {
		avatarUrl: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		displayName: 'Test User',
		email: 'test@test.com',
		id: 12345678,
		ip: '127.0.0.1',
		isBlocked: false,
		url: 'http://discover.wordpress.com',
		username: 'testuser',
	},

	post: {
		author: { displayName: 'Test User' },
		title: 'Test Post',
		url: 'http://discover.wordpress.com',
	},
};
