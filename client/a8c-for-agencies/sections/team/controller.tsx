import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import TeamInvite from './primary/team-invite';
import TeamList from './primary/team-list';

export const teamContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Manage team" path={ context.path } />
			<TeamList />
		</>
	);

	next();
};

export const teamInviteContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Manage team > Invite a team member" path={ context.path } />
			<TeamInvite />
		</>
	);

	next();
};
