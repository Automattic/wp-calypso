import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import { A4A_TEAM_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	currentAgency: Agency;
	targetAgency: Agency;
	isOwner: boolean;
};

export default function NoMultiAgencyMessage( { currentAgency, targetAgency, isOwner }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const onLearnMoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_learn_more_joining_agency_click' ) );
		showSupportGuide(
			'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#accepting-an-invitation-a-team-member-s-guide'
		);
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
				{ translate( 'You can only join one agency dashboard at a time.' ) }
			</div>

			<div className="team-accept-invite__subtitle">
				{ isOwner
					? translate(
							'To join %(targetAgencyName)s, first transfer ownership of %(currentAgencyName)s to another team member, then leave its dashboard.',
							{
								args: {
									targetAgencyName: targetAgency?.name,
									currentAgencyName: currentAgency?.name,
								},
								comment: '%(targetAgencyName)s and %(currentAgencyName)s are agency names',
							}
						)
					: translate(
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
				{ isOwner && (
					<StepSectionItem
						stepNumber={ 1 }
						heading={
							translate( 'Transfer ownership of %(currentAgencyName)s', {
								args: { currentAgencyName: currentAgency.name },
								comment: '%(currentAgencyName)s is an agency name',
							} ) as string
						}
						description={ translate(
							'In the {{a}}Team section{{/a}}, make another active team member the owner. You’ll become a regular team member.',
							{
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
				) }

				<StepSectionItem
					stepNumber={ isOwner ? 2 : 1 }
					heading={
						translate( 'Leave the %(currentAgencyName)s dashboard', {
							args: { currentAgencyName: currentAgency.name },
							comment: '%(currentAgencyName)s is an agency name',
						} ) as string
					}
					description={
						isOwner
							? translate( 'Then remove yourself in the Team section.' )
							: translate(
									'Visit the {{a}}%(currentAgencyName)s{{/a}} dashboard and remove yourself in the Team section.',
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
								)
					}
				/>

				<StepSectionItem
					stepNumber={ isOwner ? 3 : 2 }
					heading={
						translate( 'Join the %(targetAgencyName)s dashboard', {
							args: { targetAgencyName: targetAgency?.name },
							comment: '%(targetAgencyName)s is an agency name',
						} ) as string
					}
					description={ translate(
						'Click the invite link in your email again to join %(targetAgencyName)s.',
						{
							args: { targetAgencyName: targetAgency?.name },
							comment: '%(targetAgencyName)s is an agency name',
						}
					) }
				/>
			</StepSection>

			{ isOwner && (
				<div className="team-accept-invite__subtitle">
					{ translate( 'No other team members? Contact support for help.' ) }
				</div>
			) }

			<StepSection heading={ translate( 'Learn more about Agency membership' ) }>
				<Button
					className="team-accept-invite__learn-more-button"
					variant="link"
					onClick={ onLearnMoreClick }
				>
					{ translate( 'Team members Knowledge Base article' ) }
				</Button>
				<br />
				<Button
					className="team-accept-invite__learn-more-button"
					variant="link"
					href={ CONTACT_URL_HASH_FRAGMENT }
					onClick={ onContactSupportClick }
				>
					{ translate( 'Contact support' ) }
				</Button>
			</StepSection>
		</>
	);
}
