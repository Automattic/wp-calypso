import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecuritySshKey() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'SSH key' ) }
					description={ __(
						'Add an SSH key to your WordPress.com account to make it available for SFTP and SSH authentication.'
					) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
