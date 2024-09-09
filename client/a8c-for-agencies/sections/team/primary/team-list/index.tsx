import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import PagePlaceholder from 'calypso/a8c-for-agencies/components/page-placeholder';
import {
	A4A_TEAM_INVITE_LINK,
	A4A_TEAM_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { TAB_ACTIVE_MEMBERS, TAB_INVITED_MEMBERS } from '../../constants';
import { useMemberList } from '../../hooks/use-member-list';
import { TeamMember } from '../../types';
import GetStarted from '../get-started';
import { TeamTable } from './table';

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
	data: TeamMember[];
};

export default function TeamList( { currentTab }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { activeMembers, invitedMembers, hasMembers, isPending, refetch } = useMemberList();

	const title = translate( 'Manage team members' );

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
				data: activeMembers,
			},
			{
				key: TAB_INVITED_MEMBERS,
				label: translate( 'Invited' ),
				count: invitedMembers?.length,
				selected: currentTab === TAB_INVITED_MEMBERS,
				path: `${ A4A_TEAM_LINK }/${ TAB_INVITED_MEMBERS }`,
				data: invitedMembers,
			},
		];

		const selected: Tab = items.find( ( tab: Tab ) => tab.selected ) ?? items[ 0 ];

		return {
			items,
			selected,
		};
	}, [ activeMembers, currentTab, invitedMembers, translate ] );

	if ( isPending ) {
		return <PagePlaceholder />;
	}

	if ( ! hasMembers ) {
		return <GetStarted />;
	}

	return (
		<Layout className="team-list full-width-layout-with-table" title={ title } wide compact>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
					<Actions>
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
			<LayoutBody>
				<TeamTable data={ tabs.selected.data } onRefresh={ refetch } />
			</LayoutBody>
		</Layout>
	);
}
