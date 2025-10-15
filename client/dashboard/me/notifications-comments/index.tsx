import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DevicesSettings } from './device-settings';
import { EmailSettings } from './email-settings';
import { WebSettings } from './web-settings';

export default function NotificationsComments() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Comments' ) }
					description={ __(
						'Set your notification preferences for activity on comments you’ve made on other sites.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<WebSettings />
				<EmailSettings />
				<DevicesSettings />
			</VStack>
		</PageLayout>
	);
}
