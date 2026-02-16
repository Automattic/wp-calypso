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
import ReaderYouTubeIcon from 'calypso/reader/components/icons/youtube-icon';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';

export default function AddYouTube(): JSX.Element {
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
		<div className="reader-add-youtube">
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
				<div className={ `reader-add-youtube__form${ isEmailVerified ? '' : ' is-disabled' }` }>
					<AddSitesForm
						placeholder={ translate( 'Search by YouTube URL' ) }
						buttonText={ translate( 'Add Feed' ) }
						pathname="/reader/new/youtube"
						source="reader-add-youtube"
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
					/>
				</div>
				{ ! hasFeedPreview ? (
					<div className="reader-add-youtube__instructions">
						<div className="reader-add-youtube__instructions-icon">
							<ReaderYouTubeIcon iconSize={ 75 } />
						</div>
						<h2 className="reader-add-youtube__instructions-title">
							{ translate( 'Common YouTube URLs' ) }
						</h2>
						<ul className="reader-add-youtube__instructions-list">
							<li>
								<strong>{ translate( 'Channel feed:' ) }</strong>
								{ ' www.youtube.com/@YT_HANDLE' }
							</li>
							<li>
								<strong>{ translate( 'Playlist feed:' ) }</strong>
								{ ' www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID' }
							</li>
						</ul>
					</div>
				) : null }
			</SubscriptionManagerContextProvider>
		</div>
	);
}
