import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	A4A_OVERVIEW_LINK,
	A4A_TEAM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/sections/referrals/common/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/sections/referrals/common/step-section-item';
import { Agency } from 'calypso/state/a8c-for-agencies/types';

type Props = {
	currentAgency: Agency;
	invitingAgencyName?: string;
};

export default function NoMultiAgencyMessage( { currentAgency, invitingAgencyName = '' }: Props ) {
	const translate = useTranslate();

	return (
		<>
			<div className="team-accept-invite__heading">
				{ translate( `You can only join one agency dashboard at a time.` ) }
			</div>

			<div className="team-accept-invite__subtitle">
				{ translate(
					'To join %(invitingAgencyName)s, first leave the %(currentAgencyName)s dashboard.',
					{
						args: {
							invitingAgencyName,
							currentAgencyName: currentAgency.name,
						},
						comment: '%(invitingAgencyName)s and %(currentAgencyName)s are agency names',
					}
				) }
			</div>

			<StepSection heading={ translate( 'How to fix this:' ) }>
				<StepSectionItem
					isNewLayout
					stepNumber={ 1 }
					heading={
						translate( 'Leave the %(currentAgencyName)s Dashboard', {
							args: { currentAgencyName: currentAgency.name },
							comment: '%(currentAgencyName)s is an agency name',
						} ) as string
					}
					description={
						<>
							{ translate(
								`Visit the {{a}}%(currentAgencyName)s{{/a}} dashboard and remove yourself in the Team section.`,
								{
									args: { currentAgencyName: currentAgency.name },
									comment: '%(currentAgencyName)s is an agency name',
									components: {
										a: (
											<a
												className="team-accept-invite__link"
												href={ A4A_TEAM_LINK }
												target="_blank"
												rel="noreferrer"
											/>
										),
									},
								}
							) }
						</>
					}
				/>

				<StepSectionItem
					isNewLayout
					stepNumber={ 2 }
					heading={
						translate( 'Join the %(invitingAgencyName)s Dashboard', {
							args: { invitingAgencyName },
							comment: '%(invitingAgencyName)s is an agency name',
						} ) as string
					}
					description={
						<>
							{ translate(
								`Click the invite link in your email again to join %(invitingAgencyName)s.`,
								{
									args: { invitingAgencyName },
									comment: '%(invitingAgencyName)s is an agency name',
								}
							) }
						</>
					}
				/>
			</StepSection>

			<StepSection heading={ translate( 'Learn more about Agency membership' ) }>
				<Button
					className="team-accept-invite__learn-more-button"
					variant="link"
					target="_blank"
					href="#" // FIXME: Add link to the KB article
				>
					{ translate( 'Team members Knowledge Base article' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
				<br />
				<Button
					className="team-accept-invite__learn-more-button"
					variant="link"
					target="_blank"
					href={ `${ A4A_OVERVIEW_LINK }#contact-support` }
				>
					{ translate( 'Contact support' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
			</StepSection>
		</>
	);
}
