import { __ } from '@wordpress/i18n';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AccountDeletionSection from '../profile-deletion';
import GravatarProfileSection from '../profile-gravatar';
import PersonalDetailsSection from '../profile-personal-details';

export default function Account() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					description={
						<>
							{ __( 'Set your name, bio, and other public-facing information.' ) }{ ' ' }
							<InlineSupportLink supportContext="manage-profile" />
						</>
					}
				/>
			}
		>
			<PersonalDetailsSection />
			<GravatarProfileSection />
			<AccountDeletionSection />
			<PerformanceTrackerStop />
		</PageLayout>
	);
}
