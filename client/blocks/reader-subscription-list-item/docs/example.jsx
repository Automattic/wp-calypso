/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ReaderSubscriptionListItem from '../';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';


const items = [
	{
		siteAuthor: {
			avatar_URL: 'https://2.gravatar.com/avatar/83cb16245c3d8ac5f625ebf91a7827e7?d=identicon&r=G&s=1600A',
			first_name: 'Allison',
			last_name: undefined,
		},
		siteUrl: 'http://afarmgirlslife.wordpress.com',
		siteTitle: 'A Farm Girls Life',
		siteExcerpt: 'Photography, Crafty Things, and Life on the Farm',
		lastUpdated: new Date() - 10000000,
		feedId: '21587482',
	},
	{
		siteAuthor: {
			avatar_URL: 'https://2.gravatar.com/avatar/bd02f74face048cc62c4eda28cea9937?d=mm&r=G&s=96',
			first_name: undefined,
			last_name: undefined,
		},
		siteUrl: 'https://fourthgenerationfarmgirl.com/',
		siteTitle: 'fourth generation farmgirl',
		siteExcerpt: 'wool and wine to tractors and travel',
		lastUpdated: new Date() - 5000,
		feedId: '24393283',
	},
	{
		siteAuthor: {
			avatar_URL: 'https://1.gravatar.com/avatar/d1becc42ff085294b51c77f3ce850b15?d=mm&r=G&s=96',
			first_name: 'Morgan',
			last_name: 'Pencek',
		},
		siteUrl: 'https://notyourtypicalhippie.wordpress.com/',
		siteTitle: 'Not Your Typical Hippi',
		siteExcerpt: 'Starting Young ♢ Living Healthy',
		lastUpdated: new Date() - 100000,
		feedId: '42747358',
	}
]

export default class ReaderSubscriptionListItemExample extends PureComponent {
	static displayName = 'ReaderSubscriptionListItem';

	render() {
		return (
			<Card>
				{ items.map( item =>
						<ReaderSubscriptionListItem
							isFollowing={ true }
							key={ item.siteUrl }
							{ ...item }
						/>
				) }
			</Card>
		);
	}
};
