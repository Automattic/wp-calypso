import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useAuth } from '../../app/auth';
import { PerformanceTrackerStop } from '../../app/performance-tracking';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import AccountDeletionSection from '../profile-deletion';
import PersonalDetailsSection from '../profile-personal-details';
import GravatarLogo from './gravatar-logo';

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
								sprintf(
									/* translators: %s: the user's email address */
									__(
										'Set the name, avatar, and details that identify you on WordPress.com. Most of them are also your <logo/><gravatar>Gravatar profile</gravatar>, shown on other sites when you comment with <strong>%s</strong>.'
									),
									user.email
								),
								{
									strong: <strong />,
									logo: <GravatarLogo />,
									// @ts-expect-error children prop is injected by createInterpolateElement
									gravatar: <ExternalLink href="https://gravatar.com/profile" />,
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
