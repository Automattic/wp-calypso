import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AccountDeletionSection from '../profile-deletion';
import PersonalDetailsSection from '../profile-personal-details';
import GravatarLogo from './gravatar-logo';

function GravatarProfileLink( { children }: { children?: React.ReactNode } ) {
	return (
		<span style={ { whiteSpace: 'nowrap' } }>
			<GravatarLogo /> <ExternalLink href="https://gravatar.com/profile">{ children }</ExternalLink>
		</span>
	);
}

export default function Account() {
	const { user } = useAuth();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					description={
						<>
							{ createInterpolateElement(
								__(
									'Set the name, avatar, and details that identify you on WordPress.com. Most of them are also your <gravatar>Gravatar profile</gravatar>, shown on other sites when you comment with <email/>.'
								),
								{
									email: <strong>{ user.email }</strong>,
									gravatar: <GravatarProfileLink />,
								}
							) }{ ' ' }
							<InlineSupportLink supportContext="manage-profile" />
						</>
					}
				/>
			}
		>
			<PersonalDetailsSection />
			<AccountDeletionSection />
			<PerformanceTrackerStop />
		</PageLayout>
	);
}
