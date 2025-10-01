import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronRight, chevronLeft } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { DevicesSettings } from './device-settings';
import { EmailSettings } from './email-settings';
import { WebSettings } from './web-settings';

export default function NotificationsComments() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={
						<RouterLinkButton
							className="dashboard-page-header__back-button"
							icon={ isRTL() ? chevronRight : chevronLeft }
							to="/me/notifications"
						>
							{ __( 'Back' ) }
						</RouterLinkButton>
					}
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
