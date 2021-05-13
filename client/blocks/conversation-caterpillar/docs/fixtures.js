/**
 * External dependencies
 */
import { keyBy, map } from 'lodash';

export const comments = [
	{
		ID: 1,
		content: '<p>Chocolate cake</p>',
		author: {
			ID: 1,
			name: 'Christophe',
			email: 'christophe@example.com',
			avatar_URL:
				'https://2.gravatar.com/avatar/5512fbf07ae3dd340fb6ed4924861c8e?s=96&d=identicon&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T14:50:33+00:00',
	},
	{
		ID: 2,
		content: '<p>Ice-cream cone</p>',
		author: {
			ID: 2,
			name: 'Boris',
			email: 'boris@example.com',
			avatar_URL: 'https://2.gravatar.com/avatar/22d41e5b6ff197cd7900c0514d1bd305?d=mm&r=G',
			has_avatar: false, // Test that authors with has_avatar: false are omitted
		},
		date: '2016-04-18T14:50:33+00:00',
	},
	{
		ID: 3,
		content: '<p>Pickle</p>',
		author: {
			ID: 3,
			name: 'Matt Mullenweg',
			email: 'matt@example.com',
			avatar_URL: 'https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T14:59:22+00:00',
	},
	{
		ID: 4,
		content: '<p>Swiss cheese</p>',
		author: {
			ID: 1,
			name: 'Christophe',
			email: 'christophe@example.com',
			avatar_URL:
				'https://2.gravatar.com/avatar/5512fbf07ae3dd340fb6ed4924861c8e?s=96&d=identicon&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 5,
		content: '<p>I have no avatar, sad panda</p>',
		author: {
			ID: 1,
			name: 'Anon',
			avatar_URL: null,
			has_avatar: false,
		},
		date: '2016-04-18T15:23:00+00:00',
	},
	{
		ID: 6,
		content: '<p>Salami</p>',
		author: {
			ID: 6,
			name: 'Ben',
			email: 'ben@example.com',
			avatar_URL: 'https://0.gravatar.com/avatar/3b7b2c457b9201d166b9a2b47cadc86d?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 7,
		content: '<p>Lollipop</p>',
		author: {
			ID: 7,
			name: 'Derek',
			email: 'derek@example.com',
			avatar_URL: 'https://2.gravatar.com/avatar/2723d05b4e1176e977e1e6641a2ca98b?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 8,
		content: '<p>Cherry pie</p>',
		author: {
			ID: 8,
			name: 'Jake',
			email: 'jake@example.com',
			avatar_URL: 'https://1.gravatar.com/avatar/7a6c0fad3d7e9d4038222cbadd095db8?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 9,
		content: '<p>Cupcake</p>',
		author: {
			ID: 9,
			name: 'Jan',
			email: 'jan@example.com',
			avatar_URL:
				'https://secure.gravatar.com/avatar/3e44726f128c263db20117a659bfa003?d=mm&s=275&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 10,
		content: '<p>Watermelon</p>',
		author: {
			ID: 10,
			name: 'Aaron',
			email: 'aaron@example.com',
			avatar_URL: 'https://2.gravatar.com/avatar/20600ea4d39b6facdd79875d24d2dbab?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 11,
		content: '<p>Bagel</p>',
		author: {
			ID: 11,
			name: 'Greg',
			email: 'greg@example.com',
			avatar_URL: 'https://0.gravatar.com/avatar/915ee4efbd21f12b55b6362cf4f7c42f?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 11,
		content: '<p>Apple</p>',
		author: {
			ID: 11,
			name: 'Greg',
			email: 'greg@example.com',
			avatar_URL: 'https://1.gravatar.com/avatar/765b5dca3190e27b9c88d6143c5527d5?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 12,
		content: '<p>Pancake</p>',
		author: {
			ID: 12,
			name: 'Martin',
			email: 'martin@example.com',
			avatar_URL: 'https://0.gravatar.com/avatar/33b3e384f5a150015a5a981402983ca3?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
	{
		ID: 13,
		content: '<p>Gelato</p>',
		author: {
			ID: 13,
			name: 'Yanir',
			email: 'yanir@example.com',
			avatar_URL: 'https://1.gravatar.com/avatar/dda019c47a6183120608a6aeac2db6c5?d=mm&r=G',
			has_avatar: true,
		},
		date: '2016-04-18T15:22:00+00:00',
	},
];

export const commentsTree = {
	...keyBy( comments, 'ID' ),
	children: map( comments, 'ID' ),
};
