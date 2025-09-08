import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import SecurityPageHeader from '../security-page-header';
import SecurityTwoStepAuthEmptyState from './empty-state';
import SecurityTwoStepAuthMainPage from './main-page';

export default function SecurityTwoStepAuth() {
	const { data: userSettings } = useQuery( userSettingsQuery() );

	const isTwoStepEnabled = userSettings?.two_step_enabled;

	return (
		<PageLayout
			size="small"
			header={
				<SecurityPageHeader
					title={ __( 'Two-step authentication' ) }
					description={
						isTwoStepEnabled
							? __(
									'When you log in to WordPress.com, you‘ll need to enter your username and password, as well as a unique passcode sent to you via test message.'
							  )
							: __(
									'Keep your account extra safe with two-step authentication. You‘ll use your password plus a temporary code from your phone to sign in.'
							  )
					}
				/>
			}
		>
			{ isTwoStepEnabled ? (
				<SecurityTwoStepAuthMainPage userSettings={ userSettings } />
			) : (
				<SecurityTwoStepAuthEmptyState />
			) }
		</PageLayout>
	);
}
