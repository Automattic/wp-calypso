import { TimeSince } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { memo, useMemo } from 'react';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useRecordCommentNotificationsToggle } from 'calypso/landing/subscriptions/tracks';
import { CommentSettings } from '../settings';
import type { PostSubscription } from '@automattic/data-stores/src/reader/types';

type CommentRowProps = PostSubscription & {
	forwardedRef: React.Ref< HTMLDivElement >;
	style: React.CSSProperties;
};

const CommentRow = ( {
	id,
	post_id,
	post_title,
	post_excerpt,
	post_url,
	blog_id,
	site_title,
	site_icon,
	site_url,
	date_subscribed,
	forwardedRef,
	style,
	is_wpforteams_site,
	is_paid_subscription,
	notification = { send_comments: false },
}: CommentRowProps ) => {
	const translate = useTranslate();
	const hostname = useMemo( () => new URL( site_url ).hostname, [ site_url ] );

	const { mutate: notifyMeOfNewComments, isPending: notifyingMeOfNewComments } =
		SubscriptionManager.usePostNotifyMeOfNewCommentsMutation();

	const { mutate: unsubscribe, isPending: unsubscribing } =
		SubscriptionManager.usePostUnsubscribeMutation();

	const recordCommentNotificationsToggle = useRecordCommentNotificationsToggle();

	const handleNotifyMeOfNewCommentsChange = ( value: boolean ) => {
		notifyMeOfNewComments( {
			subscriptionId: id,
			sendComments: value,
		} );

		recordCommentNotificationsToggle( value, { blog_id, post_id } );
	};

	return (
		<div style={ style } ref={ forwardedRef } className="row-wrapper">
			<div className="row" role="row">
				<span className="post" role="cell">
					<div className="title">
						<a href={ post_url } target="_blank" rel="noreferrer noopener">
							{ post_title || translate( 'Untitled' ) }
						</a>
					</div>
					{ post_excerpt && <div className="excerpt">{ post_excerpt }</div> }
				</span>
				<a href={ site_url } rel="noreferrer noopener" className="title-box" target="_blank">
					<span className="title-box" role="cell">
						<SiteIcon iconUrl={ site_icon } size={ 40 } alt={ site_title } />
						<span className="title-column">
							<span className="name">
								{ site_title }
								{ !! is_wpforteams_site && <span className="p2-label">P2</span> }
								{ !! is_paid_subscription && (
									<span className="paid-label">
										{ translate( 'Paid', { context: 'Label for a paid subscription plan' } ) }
									</span>
								) }
							</span>
							<span className="url">{ hostname }</span>
						</span>
					</span>
				</a>
				<span className="date" role="cell">
					<TimeSince
						date={
							( date_subscribed.valueOf() ? date_subscribed : new Date( 0 ) ).toISOString?.() ??
							date_subscribed
						}
					/>
				</span>
				<span className="actions" role="cell">
					<CommentSettings
						notifyMeOfNewComments={ notification?.send_comments ?? false }
						onNotifyMeOfNewCommentsChange={ handleNotifyMeOfNewCommentsChange }
						updatingNotifyMeOfNewComments={ notifyingMeOfNewComments }
						onUnsubscribe={ () => unsubscribe( { post_id, blog_id, id } ) }
						unsubscribing={ unsubscribing }
					/>
				</span>
			</div>
		</div>
	);
};

export default memo( CommentRow );
