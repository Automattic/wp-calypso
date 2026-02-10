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
import ReaderTumblrIcon from 'calypso/reader/components/icons/tumblr-icon';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';

export default function AddTumblr(): JSX.Element {
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

	/**
	 * Transforms a Tumblr URL to its RSS feed equivalent (/rss at the end).
	 * If the URL already contains /rss, it's returned unchanged.
	 */
	function transformTumblrUrl( url: string ): string {
		if ( url.endsWith( '/rss' ) ) {
			return url;
		}

		let parsedUrl: URL;
		try {
			parsedUrl = new URL( url );
		} catch {
			return url;
		}

		if ( ! parsedUrl.hostname.includes( 'tumblr.com' ) ) {
			return url;
		}

		const pathname = parsedUrl.pathname;

		// Append /rss to the end of the path.
		const cleanPath = pathname.endsWith( '/' ) ? pathname.slice( 0, -1 ) : pathname;
		parsedUrl.pathname = cleanPath + '/rss';

		return parsedUrl.toString();
	}

	return (
		<div className="reader-add-tumblr">
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
				<div className={ `reader-add-tumblr__form${ isEmailVerified ? '' : ' is-disabled' }` }>
					<AddSitesForm
						placeholder={ translate( 'Search by Tumblr URL' ) }
						buttonText={ translate( 'Add Feed' ) }
						pathname="/reader/new/tumblr"
						source="new-tumblr-subscription"
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
						transformUrl={ transformTumblrUrl }
					/>
				</div>
				{ ! hasFeedPreview ? (
					<div className="reader-add-tumblr__instructions">
						<div className="reader-add-tumblr__instructions-icon">
							<ReaderTumblrIcon iconSize={ 75 } />
						</div>

						<h2 className="reader-add-tumblr__instructions-title">
							{ translate( 'Common Tumblr URLs' ) }
						</h2>

						<ul className="reader-add-tumblr__instructions-list">
							<li>
								<strong>{ translate( 'Staff Picks:' ) }</strong>
								{ ' https://staff.tumblr.com/rss' }
							</li>
							<li>
								<strong>{ translate( 'A blog:' ) }</strong>
								{ ' https://{ BLOG_NAME }.tumblr.com/rss' }
							</li>
							<li>
								<strong>{ translate( 'Blog tag:' ) }</strong>
								{ ' https://{ BLOG_NAME }.tumblr.com/tagged/{ TAG_NAME }/rss' }
							</li>
						</ul>
					</div>
				) : null }
			</SubscriptionManagerContextProvider>
		</div>
	);
}
