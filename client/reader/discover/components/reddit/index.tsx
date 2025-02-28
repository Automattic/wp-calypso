import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import ReaderRedditIcon from 'calypso/reader/components/icons/reddit-icon';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

import './style.scss';

const Reddit = () => {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const needsEmailVerification = isLoggedIn && ! isEmailVerified;

	return (
		<div className="discover-reddit">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				{ needsEmailVerification && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Please verify your email before subscribing.' ) }
					>
						<a href="/me/account" className="notice__action">
							{ translate( 'Account Settings' ) }
						</a>
					</Notice>
				) }
				<div className={ `discover-reddit__form${ needsEmailVerification ? ' is-disabled' : '' }` }>
					<AddSitesForm
						placeholder={ translate( 'Search by Reddit URL' ) }
						buttonText={ translate( 'Add Feed' ) }
						source="discover-reddit"
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
