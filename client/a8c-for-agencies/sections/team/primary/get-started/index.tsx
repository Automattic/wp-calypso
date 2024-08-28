import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { A4A_TEAM_INVITE_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../../referrals/common/step-section';
import StepSectionItem from '../../../referrals/common/step-section-item';

import './style.scss';

export default function GetStarted() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Manage team members' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
	};

	return (
		<Layout className="team-list-get-started" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<Button variant="primary" onClick={ onInviteClick } href={ A4A_TEAM_INVITE_LINK }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div className="team-list-get-started__heading">
					{ translate( `Invite team members to help manage your clients' sites.` ) }
				</div>

				<div className="team-list-get-started__subtitle">
					{ translate(
						'You can invite team members to manage sites and referrals for your clients.'
					) }
				</div>

				<StepSection heading={ translate( 'How do I start?' ) }>
					<StepSectionItem
						isNewLayout
						stepNumber={ 1 }
						heading={ translate( 'Invite a team member' ) }
						description={
							<>
								{ translate(
									`Team members get almost the same permissions as admins, but they can't do things like:`
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
						href="#" // FIXME: Add link to the KB article
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
