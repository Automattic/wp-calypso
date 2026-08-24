import { __ } from '@wordpress/i18n';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

function NotificationsInbox() {
	return <PageLayout header={ <PageHeader title={ __( 'Notifications' ) } /> } />;
}

export default NotificationsInbox;
