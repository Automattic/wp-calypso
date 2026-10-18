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

export default function Account() {
	const { user } = useAuth();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					description={
						<>
							{ __( 'Set your name, bio, and other public-facing information.' ) }{ ' ' }
							{ createInterpolateElement(
								sprintf(
									/* translators: %s: User email */
									__(
										'Your profile photo, display name, and bio are also your public Gravatar profile, which sites that use Gravatar show wherever you use <strong>%s</strong>. Edit them here or on your <external>Gravatar profile</external>; changes apply to both.'
									),
									user.email
								),
								{
									strong: <strong />,
									// @ts-expect-error children prop is injected by createInterpolateElement
									external: <ExternalLink href="https://gravatar.com/profile" />,
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
