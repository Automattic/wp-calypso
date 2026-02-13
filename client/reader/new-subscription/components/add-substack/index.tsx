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
import ReaderSubstackIcon from 'calypso/reader/components/icons/substack-icon';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { requestFollows } from 'calypso/state/reader/follows/actions';

export default function AddSubstack(): JSX.Element {
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
	 * Transforms a Substack URL to its RSS feed equivalent (/feed at the end).
	 * If the URL already contains /feed, it's returned unchanged.
	 */
	function transformSubstackUrl( url: string ): string {
		if ( url.includes( '/feed' ) ) {
			return url;
		}

		let parsedUrl: URL;
		try {
			parsedUrl = new URL( url );
		} catch {
			return url;
		}

		if ( ! parsedUrl.hostname.includes( 'substack.com' ) ) {
			return url;
		}

		const pathname = parsedUrl.pathname;

		// Handle root path or paths without /feed by appending /feed.
		const cleanPath = pathname.endsWith( '/' ) ? pathname.slice( 0, -1 ) : pathname;
		parsedUrl.pathname = cleanPath + '/feed';

		return parsedUrl.toString();
	}

	return (
		<div className="reader-add-substack">
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
				<div className={ `reader-add-substack__form${ isEmailVerified ? '' : ' is-disabled' }` }>
					<AddSitesForm
						placeholder={ translate( 'Search by Substack URL' ) }
						buttonText={ translate( 'Add Feed' ) }
						pathname="/reader/new/substack"
						source="reader-add-substack"
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
						transformUrl={ transformSubstackUrl }
					/>
				</div>
				{ ! hasFeedPreview ? (
					<div className="reader-add-substack__instructions">
						<div className="reader-add-substack__instructions-icon">
							<ReaderSubstackIcon iconSize={ 75 } />
						</div>
						<h2 className="reader-add-substack__instructions-title">
							{ translate( 'Common Substack URLs' ) }
						</h2>
						<ul className="reader-add-substack__instructions-list">
							<li>
								<strong>{ translate( 'Publication feed:' ) }</strong>
								{ ' https://{ PUBLICATION }.substack.com/feed' }
							</li>
							<li>
								<strong>{ translate( 'Custom domain:' ) }</strong>
								{ ' https://{ CUSTOM_DOMAIN }/feed' }
							</li>
						</ul>
					</div>
				) : null }
			</SubscriptionManagerContextProvider>
		</div>
	);
}
