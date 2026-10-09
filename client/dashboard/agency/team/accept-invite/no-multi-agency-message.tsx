import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { useHelpCenter } from '../../../app/help-center';
import { ActionList } from '../../../components/action-list';
import Notice from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { TEAM_ROUTE } from '../paths';
import type { AgencyTeamInviteAgency } from '@automattic/api-core';

const TEAM_MEMBERS_SUPPORT_URL =
	'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#accepting-an-invitation-a-team-member-s-guide';

// TODO: the MSD dashboard has no contact-support entry point yet (A4A-3422).
const CONTACT_SUPPORT_URL = '#contact-support';

export default function NoMultiAgencyMessage( {
	currentAgency,
	targetAgency,
}: {
	currentAgency: AgencyTeamInviteAgency;
	targetAgency: AgencyTeamInviteAgency;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const openSupportGuide = () => {
		recordTracksEvent( 'calypso_a4a_team_learn_more_joining_agency_click' );
		setShowHelpCenter( true );
		setNavigateToRoute( '/post?link=' + encodeURIComponent( TEAM_MEMBERS_SUPPORT_URL ) );
	};

	return (
		<>
			<Notice variant="warning" title={ __( 'You can only join one agency dashboard at a time.' ) }>
				<Text>
					{ sprintf(
						/* translators: %1$s and %2$s are agency names */
						__( 'To join %1$s, first leave the %2$s dashboard.' ),
						targetAgency.name,
						currentAgency.name
					) }
				</Text>
			</Notice>
			<ActionList title={ __( 'How to fix this:' ) }>
				<ActionList.ActionItem
					title={ sprintf(
						/* translators: %s is an agency name */
						__( 'Leave the %s dashboard' ),
						currentAgency.name
					) }
					description={ sprintf(
						/* translators: %s is an agency name */
						__( 'Visit the %s dashboard and remove yourself in the Team section.' ),
						currentAgency.name
					) }
					actions={
						<RouterLinkButton
							variant="secondary"
							size="compact"
							to={ TEAM_ROUTE }
							target="_blank"
							rel="noreferrer"
							onClick={ () => recordTracksEvent( 'calypso_a4a_team_current_agency_link_click' ) }
						>
							{ __( 'Go to Team' ) }
						</RouterLinkButton>
					}
				/>
				<ActionList.ActionItem
					title={ sprintf(
						/* translators: %s is an agency name */
						__( 'Join the %s dashboard' ),
						targetAgency.name
					) }
					description={ sprintf(
						/* translators: %s is an agency name */
						__( 'Click the invite link in your email again to join %s.' ),
						targetAgency.name
					) }
					actions={ null }
				/>
			</ActionList>
			<VStack spacing={ 3 } alignment="flex-start">
				<SectionHeader level={ 3 } title={ __( 'Learn more about Agency membership' ) } />
				<Button variant="link" onClick={ openSupportGuide }>
					{ __( 'Team members Knowledge Base article' ) }
				</Button>
				<Button
					variant="link"
					href={ CONTACT_SUPPORT_URL }
					onClick={ () => recordTracksEvent( 'calypso_a4a_team_contact_support_click' ) }
				>
					{ __( 'Contact support' ) }
				</Button>
			</VStack>
		</>
	);
}
