import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import SecurityPageHeader from '../security-page-header';

export default function SecurityTwoStepAuth() {
	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Two-step authentication' ) }
					description={ __(
						'Keep your account extra safe with two-step authentication. You’ll use your password plus a temporary code from your phone to sign in.'
					) }
				/>
			}
		>
			<Text>Content goes here</Text>
		</PageLayout>
	);
}
