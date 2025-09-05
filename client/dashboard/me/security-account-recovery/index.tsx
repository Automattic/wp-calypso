import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecurityAccountRecovery() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Account recovery' ) }
					description={ __(
						'If you ever have problems accessing your account, WordPress.com will use what you enter here to verify your identity.'
					) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
