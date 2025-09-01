import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { profileQuery } from '../../app/queries/me-profile';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import './style.scss';
import AccountDeletionSection from './account-deletion-section';
import GravatarProfileSection from './gravatar-profile-section';
import { PersonalDetailsSection } from './personal-details-section';

export default function Profile() {
	const { data: serverData } = useQuery( profileQuery() );

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
