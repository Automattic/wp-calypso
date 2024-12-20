import page from '@automattic/calypso-router';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_TEAM_INVITE_LINK,
	A4A_TEAM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/multi-sites-dashboard/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutNavigation, { LayoutNavigationTabs } from 'calypso/layout/multi-sites-dashboard/nav';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { TAB_ACTIVE_MEMBERS, TAB_INVITED_MEMBERS } from '../../constants';
import { useMemberList } from '../../hooks/use-member-list';
import GetStarted from '../get-started';
import { TeamInviteTable } from './invite-table';
import { TeamMemberTable } from './member-table';

import './style.scss';

type Props = {
	currentTab: string;
};

type Tab = {
	key: string;
	label: string;
	count?: number;
	selected: boolean;
	path: string;
	content: ReactNode;
	onClick: () => void;
};

export default function TeamList( { currentTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { activeMembers, invitedMembers, hasMembers, isPending, refetch } = useMemberList();

	const isDesktop = useDesktopBreakpoint();

	const title = isDesktop ? translate( 'Manage team members' ) : translate( 'Team' );

	const onInviteClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_team_invite_team_member_click' ) );
		page( A4A_TEAM_INVITE_LINK );
	};

	const tabs = useMemo( () => {
		const items: Tab[] = [
			{
				key: TAB_ACTIVE_MEMBERS,
				label: translate( 'Active Members' ),
				count: activeMembers?.length,
				selected: currentTab === TAB_ACTIVE_MEMBERS,
				path: `${ A4A_TEAM_LINK }/${ TAB_ACTIVE_MEMBERS }`,
				content: <TeamMemberTable members={ activeMembers } onRefresh={ refetch } />,
				onClick: () => dispatch( recordTracksEvent( 'calypso_a4a_team_active_members_tab_view' ) ),
			},
			{
				key: TAB_INVITED_MEMBERS,
				label: translate( 'Invited' ),
				count: invitedMembers?.length,
				selected: currentTab === TAB_INVITED_MEMBERS,
				path: `${ A4A_TEAM_LINK }/${ TAB_INVITED_MEMBERS }`,
				content: <TeamInviteTable members={ invitedMembers } onRefresh={ refetch } />,
				onClick: () => dispatch( recordTracksEvent( 'calypso_a4a_team_invited_members_tab_view' ) ),
			},
		];

		const selected: Tab = items.find( ( tab: Tab ) => tab.selected ) ?? items[ 0 ];

		return {
			items,
			selected,
		};
	}, [ activeMembers, currentTab, dispatch, invitedMembers, refetch, translate ] );

	if ( isPending ) {
		return <PagePlaceholder />;
	}

	if ( ! hasMembers ) {
		return <GetStarted />;
	}

	return (
		<Layout className="team-list full-width-layout-with-table" title={ title } wide>
			<LayoutTop withNavigation>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
						<MobileSidebarNavigation />
						<Button variant="primary" onClick={ onInviteClick }>
							{ translate( 'Invite a team member' ) }
						</Button>
					</Actions>
				</LayoutHeader>

				<LayoutNavigation
					selectedText={ tabs.selected.label }
					selectedCount={ tabs.selected.count }
				>
					<LayoutNavigationTabs
						selectedText={ tabs.selected.label }
						selectedCount={ tabs.selected.count }
						items={ tabs.items }
					/>
				</LayoutNavigation>
			</LayoutTop>
			<LayoutBody>{ tabs.selected.content }</LayoutBody>
		</Layout>
	);
}
