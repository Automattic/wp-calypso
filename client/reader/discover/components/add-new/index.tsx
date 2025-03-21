import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import Notice from 'calypso/components/notice';
import { AddSitesForm } from 'calypso/landing/subscriptions/components/add-sites-form';
import { SiteSubscriptionsList } from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	SubscriptionManagerContextProvider,
	SubscriptionsPortal,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

import './style.scss';

const DiscoverAddNew = () => {
	const translate = useTranslate();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const [ hasFeedPreview, setHasFeedPreview ] = useState< boolean >( false );

	const onChangeFeedPreview = useCallback( ( hasPreview: boolean ): void => {
		setHasFeedPreview( hasPreview );
	}, [] );

	const onSubscribeToggle = useCallback( (): void => {
		setHasFeedPreview( false ); // Close the feed preview when the subscription is toggled.
	}, [] );

	return (
		<div className="discover-add-new">
			<SubscriptionManagerContextProvider portal={ SubscriptionsPortal.Reader }>
				{ ! isEmailVerified && (
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
				<div className={ `discover-add-new__form${ isEmailVerified ? '' : ' is-disabled' }` }>
					<h2 className="discover-add-new__form-title">
						{ translate( 'Add new sites, newsletters, and RSS feeds to your reading list.' ) }
					</h2>
					<AddSitesForm
						source="discover-add-new"
						onChangeFeedPreview={ onChangeFeedPreview }
						onChangeSubscribe={ onSubscribeToggle }
					/>
				</div>
				{ ! hasFeedPreview && (
					<div
						className={ `discover-add-new__subscriptions${
							isEmailVerified ? '' : ' is-disabled'
						}` }
					>
						<h2 className="discover-add-new__subscriptions-title">
							{ translate( 'Your subscriptions' ) }
						</h2>
						<SiteSubscriptionsList />
					</div>
				) }
			</SubscriptionManagerContextProvider>
		</div>
	);
};

export default DiscoverAddNew;
