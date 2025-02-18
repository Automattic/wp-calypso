import { useTranslate } from 'i18n-calypso';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import ReaderRedditIcon from 'calypso/reader/components/icons/reddit-icon';

import './style.scss';

const Reddit = () => {
	const translate = useTranslate();
	return (
		<div className="discover-reddit">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				<div className="discover-reddit__form">
					<AddSitesForm
						placeholder={ translate( 'Search by Reddit URL' ) }
						buttonText={ translate( 'Add Feed' ) }
					/>
				</div>
				<div className="discover-reddit__instructions">
					<div className="discover-reddit__instructions-icon">
						<ReaderRedditIcon iconSize={ 75 } />
					</div>
					<h2 className="discover-reddit__instructions-title">
						{ translate( 'Common Reddit URLs' ) }
					</h2>
					<ul className="discover-reddit__instructions-list">
						<li>
							<strong>{ translate( 'Front page:' ) }</strong>
							{ ` https://www.reddit.com/.rss` }
						</li>
						<li>
							<strong>{ translate( 'A subreddit:' ) }</strong>
							{ ` https://www.reddit.com/r/{ SUBREDDIT }/.rss` }
						</li>
						<li>
							<strong>{ translate( 'A user:' ) }</strong>
							{ ` https://www.reddit.com/user/{ REDDITOR }/.rss` }
						</li>
						<li>
							<strong>{ translate( 'User comments:' ) }</strong>
							{ ` https://www.reddit.com/user/{ REDDITOR }/comments/.rss` }
						</li>
						<li>
							<strong>{ translate( 'User submissions:' ) }</strong>
							{ ` https://www.reddit.com/user/{ REDDITOR }/submitted/.rss` }
						</li>
						<li>
							<strong>{ translate( 'Search result:' ) }</strong>
							{ ` https://www.reddit.com/search.rss?q={ QUERY }` }
						</li>
					</ul>
				</div>
			</SubscriptionManagerContextProvider>
		</div>
	);
};

export default Reddit;
