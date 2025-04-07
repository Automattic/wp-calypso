import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import ReaderRedditIcon from 'calypso/reader/components/icons/reddit-icon';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';

const Reddit = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const [ hasFeedPreview, setHasFeedPreview ] = useState< boolean >( false );

	const onChangeFeedPreview = useCallback( ( hasPreview: boolean ): void => {
		setHasFeedPreview( hasPreview );
	}, [] );

	const onSubscribeToggle = useCallback( (): void => {
		setHasFeedPreview( false ); // Close the feed preview when the subscription is toggled.
		dispatch( requestFollows() ); // In other places we show subscriptions table due to which list get refreshed automatically. Here we need to refresh the list manually.
	}, [ dispatch ] );

	return (
		<div className="discover-reddit">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				{ ! isEmailVerified && (
					<Notice
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Please verify your email before subscribing.' ) }
					>
						<a href="/me/account" className="calypso-notice__action">
							{ translate( 'Account Settings' ) }
						</a>
					</Notice>
				) }
				<div className={ `discover-reddit__form${ isEmailVerified ? '' : ' is-disabled' }` }>
					<AddSitesForm
						placeholder={ translate( 'Search by Reddit URL' ) }
						buttonText={ translate( 'Add Feed' ) }
						pathname="/discover/reddit"
						source="discover-reddit"
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
					/>
				</div>
				{ ! hasFeedPreview ? (
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
								{ ' https://www.reddit.com/.rss' }
							</li>
							<li>
								<strong>{ translate( 'A subreddit:' ) }</strong>
								{ ' https://www.reddit.com/r/{ SUBREDDIT }/.rss' }
							</li>
							<li>
								<strong>{ translate( 'A user:' ) }</strong>
								{ ' https://www.reddit.com/user/{ REDDITOR }/.rss' }
							</li>
							<li>
								<strong>{ translate( 'User comments:' ) }</strong>
								{ ' https://www.reddit.com/user/{ REDDITOR }/comments/.rss' }
							</li>
							<li>
								<strong>{ translate( 'User submissions:' ) }</strong>
								{ ' https://www.reddit.com/user/{ REDDITOR }/submitted/.rss' }
							</li>
							<li>
								<strong>{ translate( 'Search result:' ) }</strong>
								{ ' https://www.reddit.com/search.rss?q={ QUERY }' }
							</li>
						</ul>
					</div>
				) : null }
			</SubscriptionManagerContextProvider>
		</div>
	);
};

export default Reddit;
