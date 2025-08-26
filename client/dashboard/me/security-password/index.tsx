import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecurityPassword() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Password' ) }
					description={ __(
						'Strong passwords have at least six characters, and use upper and lower case letters, numbers, and symbols like ! ” ? $ % ^ & ).'
					) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
