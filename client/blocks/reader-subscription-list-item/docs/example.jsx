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
			avatar_URL: 'https://1.gravatar.com/avatar/d32da26cc0df3353cc997eea1da557a6?s=96&d=https%3A%2F%2Fs0.wp.com%2Fi%2Fmu.gif&r=G',
			first_name: 'Ben',
			last_name: 'Orlin',
			has_avatar: false,
		},
		siteUrl: 'http://mathwithbaddrawings.com',
		siteTitle: 'Math with Bad Drawings',
		siteExcerpt: 'Math, teaching, copious metaphors, and drawings that will never ever earn a spot on the fridge',
		lastUpdated: new Date() - 1000000,
		feedId: '10056049',
		site: {
			icon: {
				img: 'https://secure.gravatar.com/blavatar/11f9cce0bbf89940278ac446f3c3505a',
			}
		}
	},
	{
   siteUrl: 'http://b19ytest.wordpress.com',
   siteTitle: 'AAAA BEST BLOG WOULD BLOG AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN AND AGAIN',
   siteAuthor:{
      name: 'b3n low3ry',
      first_name: 'Ben',
      last_name: 'Lowery',
      URL: 'http://b19y.com',
      avatar_URL: 'https://0.gravatar.com/avatar/3b7b2c457b9201d166b9a2b47cadc86d?s=96&d=identicon&r=G'
   },
   siteExcerpt:'BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS BEST SITE ON THE INTERWEBS',
   feedId:25320833,
   siteId:77147075,
   feed: {  image: 'http://s2.wp.com/i/buttonw-com.png' }
	},
	{
		siteUrl: 'http://theatlantic.com/feed/all',
		siteTitle: 'The Atlantic',
		lastUpdated: new Date() - 100000,
		feedId: '49548095',
	},
	{
		siteUrl: 'http://uproxx.com',
		siteTitle: 'Real Stories – UPROXX',
		siteExcerpt: 'The Culture Of Now',
		lastUpdated: new Date() - 100000,
		feedId: '19850964',
		site: {
			icon: {
				img: 'https://secure.gravatar.com/blavatar/bae760df0e3bd64e122a0b36facaee58',
			}
		}
	},
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
