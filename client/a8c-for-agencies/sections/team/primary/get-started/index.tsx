import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_TEAM_INVITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function GetStarted() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isDesktop = useDesktopBreakpoint();

	const title = isDesktop ? translate( 'Manage team members' ) : translate( 'Team' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
	};

	const onLearnMoreClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_learn_more_managing_members_click' ) );
	};

	return (
		<Layout className="team-list-get-started" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" onClick={ onInviteClick } href={ A4A_TEAM_INVITE_LINK }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="team-list-get-started__heading">
					{ translate( "Invite team members to help manage your clients' sites." ) }
				</div>

				<div className="team-list-get-started__subtitle">
					{ translate(
						'You can invite team members to manage sites and referrals for your clients.'
					) }
				</div>

				<StepSection heading={ translate( 'How do I start?' ) }>
					<StepSectionItem
						stepNumber={ 1 }
						heading={ translate( 'Invite a team member' ) }
						description={
							<>
								{ translate(
									"Team members get almost the same permissions as admins, but they can't do things like:"
								) }

								<ul className="team-list-get-started__excluded-operation-list">
									<li>{ translate( 'Delete sites from the dashboard.' ) }</li>
									<li>{ translate( 'Remove payment methods.' ) }</li>
									<li>{ translate( 'Cancel or revoke licenses and plans.' ) }</li>
									<li>{ translate( 'Remove other users.' ) }</li>
								</ul>
							</>
						}
						buttonProps={ {
							children: translate( 'Invite a team member' ),
							href: A4A_TEAM_INVITE_LINK,
							onClick: onInviteClick,
							primary: true,
							compact: true,
						} }
					/>
				</StepSection>

				<StepSection heading={ translate( 'Learn more about team members' ) }>
					<Button
						className="team-list-get-started__learn-more-button"
						variant="link"
						target="_blank"
						href="https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members"
						onClick={ onLearnMoreClick }
					>
						{ translate( 'Team members Knowledge Base article' ) }
						<Icon icon={ external } size={ 18 } />
					</Button>
					<br />
				</StepSection>
			</LayoutBody>
		</Layout>
	);
}
