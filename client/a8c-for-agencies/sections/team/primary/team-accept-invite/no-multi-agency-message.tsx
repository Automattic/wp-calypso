import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	A4A_OVERVIEW_LINK,
	A4A_TEAM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import { useDispatch } from 'calypso/state';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	currentAgency: Agency;
	targetAgency: Agency;
};

export default function NoMultiAgencyMessage( { currentAgency, targetAgency }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onLearnMoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_learn_more_joining_agency_click' ) );
	};

	const onContactSupportClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_contact_support_click' ) );
	};

	const onCurrentAgencyLinkClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_current_agency_link_click' ) );
	};

	return (
		<>
			<div className="team-accept-invite__heading">
				{ translate( `You can only join one agency dashboard at a time.` ) }
			</div>

			<div className="team-accept-invite__subtitle">
				{ translate(
					'To join %(targetAgencyName)s, first leave the %(currentAgencyName)s dashboard.',
					{
						args: {
							targetAgencyName: targetAgency?.name,
							currentAgencyName: currentAgency?.name,
						},
						comment: '%(targetAgencyName)s and %(currentAgencyName)s are agency names',
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
					description={ translate(
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
										onClick={ onCurrentAgencyLinkClick }
									/>
								),
							},
						}
					) }
				/>

				<StepSectionItem
					isNewLayout
					stepNumber={ 2 }
					heading={
						translate( 'Join the %(targetAgencyName)s Dashboard', {
							args: { targetAgencyName: targetAgency?.name },
							comment: '%(targetAgencyName)s is an agency name',
						} ) as string
					}
					description={ translate(
						`Click the invite link in your email again to join %(targetAgencyName)s.`,
						{
							args: { targetAgencyName: targetAgency?.name },
							comment: '%(targetAgencyName)s is an agency name',
						}
					) }
				/>
			</StepSection>

			<StepSection heading={ translate( 'Learn more about Agency membership' ) }>
				<Button
					className="team-accept-invite__learn-more-button"
					variant="link"
					target="_blank"
					href="https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#accepting-an-invitation-a-team-member-s-guide"
					onClick={ onLearnMoreClick }
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
					onClick={ onContactSupportClick }
				>
					{ translate( 'Contact support' ) }
					<Icon icon={ external } size={ 18 } />
				</Button>
			</StepSection>
		</>
	);
}
