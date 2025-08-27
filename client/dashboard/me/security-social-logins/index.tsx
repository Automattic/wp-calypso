import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecuritySocialLogins() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Social logins' ) }
					description={ __( 'Log in faster with the accounts you already use.' ) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
