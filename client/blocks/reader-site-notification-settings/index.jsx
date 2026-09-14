import './style.scss';
import { Reader } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { Icon, settings } from '@wordpress/icons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import Settings from 'calypso/assets/images/icons/settings.svg';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import FormSelect from 'calypso/components/forms/form-select';
import SVGIcon from 'calypso/components/svg-icon';
import EmailMeNewCommentsToggle from 'calypso/landing/subscriptions/components/settings/site-settings/email-me-new-comments-toggle';
import EmailMeNewPostsToggle from 'calypso/landing/subscriptions/components/settings/site-settings/email-me-new-posts-toggle';
import NotifyMeOfNewPostsToggle from 'calypso/landing/subscriptions/components/settings/site-settings/notify-me-of-new-posts-toggle';
import ReaderPopover from 'calypso/reader/components/reader-popover';
import {
	useFollowDeliveryMutations,
	useSiteSubscriptions,
} from 'calypso/reader/data/site-subscriptions';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getUserSetting from 'calypso/state/selectors/get-user-setting';

function SiteNotificationSettings( {
	iconSize = 20,
	showLabel = true,
	siteId,
	subscriptionId,
	translate,
} ) {
	const dispatch = useDispatch();
	const [ showPopover, setShowPopover ] = useState( false );
	const iconRef = useRef( null );
	const spanRef = useRef( null );
	const { subscriptions } = useSiteSubscriptions( { fetchAllPages: showPopover } );
	const subscription = subscriptions.find( ( item ) => item.blog_ID === siteId );
	const deliveryMethodsEmail = subscription?.delivery_methods?.email ?? {};
	const sendNewCommentsByEmail = !! deliveryMethodsEmail.send_comments;
	const sendNewPostsByEmail = !! deliveryMethodsEmail.send_posts;
	const emailDeliveryFrequency = deliveryMethodsEmail.post_delivery_frequency;
	const sendNewPostsByNotification =
		subscription?.delivery_methods?.notification?.send_posts ?? false;
	const { updatePostEmail, updateCommentEmail, updateDeliveryFrequency, updatePostNotifications } =
		useFollowDeliveryMutations();
	const isEmailBlocked = useSelector( ( state ) =>
		getUserSetting( state, 'subscription_delivery_email_blocked' )
	);

	const availableFrequencies = [
		{
			value: Reader.EmailDeliveryFrequency.Instantly,
			label: translate( 'Instantly' ),
		},
		{
			value: Reader.EmailDeliveryFrequency.Daily,
			label: translate( 'Daily' ),
		},
		{
			value: Reader.EmailDeliveryFrequency.Weekly,
			label: translate( 'Weekly' ),
		},
	];
	const selectedFrequency = availableFrequencies.find(
		( option ) => option.value === emailDeliveryFrequency
	);

	const togglePopoverVisibility = () => {
		setShowPopover( ! showPopover );
	};

	const closePopover = () => {
		setShowPopover( false );
	};

	const setSelected = ( deliveryFrequency ) => {
		updateDeliveryFrequency.mutate( {
			blogId: siteId,
			deliveryFrequency,
		} );

		const tracksProperties = { site_id: siteId, delivery_frequency: deliveryFrequency };
		dispatch( recordTracksEvent( 'calypso_reader_post_emails_set_frequency', tracksProperties ) );
	};

	const toggleNewPostEmail = () => {
		const tracksProperties = { site_id: siteId };

		updatePostEmail.mutate( {
			blogId: siteId,
			sendPosts: ! sendNewPostsByEmail,
			deliveryFrequency: emailDeliveryFrequency,
		} );

		if ( sendNewPostsByEmail ) {
			dispatch( recordTracksEvent( 'calypso_reader_post_emails_toggle_off', tracksProperties ) );
		} else {
			dispatch( recordTracksEvent( 'calypso_reader_post_emails_toggle_on', tracksProperties ) );
		}
	};

	const toggleNewCommentEmail = () => {
		const tracksProperties = { site_id: siteId };

		updateCommentEmail.mutate( {
			blogId: siteId,
			sendComments: ! sendNewCommentsByEmail,
		} );

		if ( sendNewCommentsByEmail ) {
			dispatch( recordTracksEvent( 'calypso_reader_comment_emails_toggle_off', tracksProperties ) );
		} else {
			dispatch( recordTracksEvent( 'calypso_reader_comment_emails_toggle_on', tracksProperties ) );
		}
	};

	const toggleNewPostNotification = () => {
		const tracksProperties = { site_id: siteId };

		updatePostNotifications.mutate( {
			blogId: siteId,
			sendPosts: ! sendNewPostsByNotification,
		} );

		if ( sendNewPostsByNotification ) {
			dispatch(
				recordTracksEvent( 'calypso_reader_post_notifications_toggle_off', tracksProperties )
			);
		} else {
			dispatch(
				recordTracksEvent( 'calypso_reader_post_notifications_toggle_on', tracksProperties )
			);
		}
	};

	if ( ! siteId ) {
		return null;
	}

	return (
		<div className="reader-site-notification-settings">
			<QueryUserSettings />
			<button
				className="reader-site-notification-settings__button"
				onClick={ togglePopoverVisibility }
				ref={ spanRef }
				aria-label={ translate( 'Notification settings' ) }
			>
				<SVGIcon
					classes="reader-following-feed"
					name="settings"
					size={ iconSize }
					icon={ Settings }
					ref={ iconRef }
				/>
				{ showLabel && (
					<span
						className="reader-site-notification-settings__button-label"
						title={ translate( 'Notification settings' ) }
					>
						{ translate( 'Settings' ) }
					</span>
				) }
			</button>

			<ReaderPopover
				onClose={ closePopover }
				isVisible={ showPopover }
				context={ iconRef.current }
				ignoreContext={ spanRef.current }
				position="bottom left"
				className="reader-site-notification-settings__popout"
			>
				<EmailMeNewPostsToggle
					className={
						isEmailBlocked
							? 'reader-site-notification-settings__popout-instructions'
							: 'reader-site-notification-settings__popout-toggle'
					}
					value={ sendNewPostsByEmail }
					hintText={
						isEmailBlocked
							? translate(
									'You currently have email delivery turned off. Visit your {{a}}Notification Settings{{/a}} to turn it back on.',
									{ components: { a: <a href="/me/notifications/subscriptions" /> } }
							  )
							: null
					}
					isDisabled={ isEmailBlocked }
					onChange={ toggleNewPostEmail }
				/>

				{ ! isEmailBlocked && sendNewPostsByEmail && (
					<div className="reader-site-notification-settings__popout-select">
						<FormSelect
							value={ selectedFrequency?.value }
							onChange={ ( event ) => setSelected( event.target.value ) }
						>
							{ availableFrequencies.map( ( option ) => (
								<option key={ option.value } value={ option.value }>
									{ option.label }
								</option>
							) ) }
						</FormSelect>
					</div>
				) }

				{ ! isEmailBlocked && (
					<EmailMeNewCommentsToggle
						className="reader-site-notification-settings__popout-toggle"
						value={ sendNewCommentsByEmail }
						onChange={ toggleNewCommentEmail }
					/>
				) }

				<NotifyMeOfNewPostsToggle
					className="reader-site-notification-settings__popout-toggle"
					value={ sendNewPostsByNotification }
					onChange={ toggleNewPostNotification }
				/>

				{ subscriptionId && (
					<Button
						className="reader-site-notification-settings__manage-subscription-button"
						icon={
							<Icon
								className="subscriptions-ellipsis-menu__item-icon"
								size={ 20 }
								icon={ settings }
							/>
						}
						href={ `/reader/subscriptions/${ subscriptionId }` }
					>
						{ translate( 'Manage subscription' ) }
					</Button>
				) }
			</ReaderPopover>
		</div>
	);
}

SiteNotificationSettings.displayName = 'SiteNotificationSettings';

SiteNotificationSettings.propTypes = {
	iconSize: PropTypes.number,
	showLabel: PropTypes.bool,
	siteId: PropTypes.number,
	subscriptionId: PropTypes.number,
	translate: PropTypes.func,
};

export default localize( SiteNotificationSettings );
