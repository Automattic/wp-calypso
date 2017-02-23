/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ReaderSubscriptionListItem from '../';
import Card from 'components/card';

export default class ReaderSubscriptionListItemExample extends PureComponent {
	displayName = 'ReaderSubscriptionListItem';

	render() {
		const feedId = 40474296;
		const siteId = null;
		const siteUrl = 'https://readersquad.wordpress.com'
		const siteTitle = 'readersquad P2'
		const siteAuthorUsername = 'samauri';
		const siteAuthorName = 'Jake';
		return (
			<Card>
				<ReaderSubscriptionListItem
					isFollowing={ true }
					siteId={ 40474296 }
					siteUrl = { siteUrl }
					siteTitle = { siteTitle }
					siteAuthor = { siteAuthorName }
					siteAuthorUsername = { siteAuthorUsername }
					siteExcerpt = 'this is the description for a SubscriptionListItem'
					/>
			</Card>
		);
	}
};
