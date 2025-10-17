import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AccountDeletionSection from '../profile-deletion';
import GravatarProfileSection from '../profile-gravatar';
import PersonalDetailsSection from '../profile-personal-details';

export default function Profile() {
	const { data: serverData } = useQuery( userSettingsQuery() );

	if ( ! serverData ) {
		return null;
	}

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
			<PersonalDetailsSection profile={ serverData } />

			<GravatarProfileSection profile={ serverData } />

			<AccountDeletionSection />
		</PageLayout>
	);
}
