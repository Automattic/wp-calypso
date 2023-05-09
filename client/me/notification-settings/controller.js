import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import CommentSettingsComponent from 'calypso/me/notification-settings/comment-settings';
import NotificationsComponent from 'calypso/me/notification-settings/main';
import NotificationSubscriptions from 'calypso/me/notification-settings/reader-subscriptions';
import WPcomSettingsComponent from 'calypso/me/notification-settings/wpcom-settings';

export function notifications( context, next ) {
	const NotificationsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Notifications', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<NotificationsTitle />
			<NotificationsComponent path={ context.path } />
		</>
	);
	next();
}

export function comments( context, next ) {
	const CommentsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Comments on other sites', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<CommentsTitle />
			<CommentSettingsComponent path={ context.path } />
		</>
	);
	next();
}

export function updates( context, next ) {
	const UpdatesTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Updates from WordPress.com', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<UpdatesTitle />
			<WPcomSettingsComponent path={ context.path } />
		</>
	);
	next();
}

export function subscriptions( context, next ) {
	const SubscriptionsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Notifications', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<SubscriptionsTitle />
			<NotificationSubscriptions path={ context.path } />
		</>
	);
	next();
}
