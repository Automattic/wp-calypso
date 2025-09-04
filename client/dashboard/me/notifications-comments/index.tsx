import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function NotificationsComments() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Comments' ) }
					description={ __(
						'Set your notification preferences for activity on comments you’ve made on other sites.'
					) }
				/>
			}
		></PageLayout>
	);
}
