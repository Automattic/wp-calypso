import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AccountDeletionSection from '../profile-deletion';
import DeveloperModeSection from '../profile-developer-mode';
import GravatarProfileSection from '../profile-gravatar';
import PersonalDetailsSection from '../profile-personal-details';

export default function Profile() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Profile' ) }
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
			<DeveloperModeSection />
			<AccountDeletionSection />
		</PageLayout>
	);
}
