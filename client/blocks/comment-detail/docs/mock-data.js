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
	i_like: false,
	id: 12345678,
	replied: true,
	status: 'approved',

	author: {
		avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=96&d=mm&r=G',
		name: 'Test User',
		email: 'test@test.com',
		ID: 12345678,
		ip: '127.0.0.1',
		isBlocked: false,
		URL: 'http://discover.wordpress.com',
		nice_name: 'testuser',
	},

	post: {
		author: { nice_name: 'Test User' },
		title: 'Test Post',
		link: 'http://discover.wordpress.com',
	},
};
