import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { JetpackConnectionHealthBanner } from 'calypso/components/jetpack/connection-health';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SectionNav from 'calypso/components/section-nav';
import useFollowersQuery from 'calypso/data/followers/use-followers-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { useIsJetpackConnectionProblem } from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem.js';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSectionNavCompact from '../people-section-nav-compact';
import Subscribers from '../subscribers';
import TeamInvites from '../team-invites';
import TeamMembers from '../team-members';
import type { FollowersQuery } from '../subscribers/types';
import type { UsersQuery } from '@automattic/data-stores';

interface Props {
	filter: string;
	search?: string;
}
function SubscribersTeam( props: Props ) {
	const translate = useTranslate();
	const { filter, search } = props;
	const site = useSelector( getSelectedSite );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, site?.ID ) );
	const isPossibleJetpackConnectionProblem = useIsJetpackConnectionProblem( site?.ID as number );
	const pendingInvites = useSelector( ( state ) =>
		getPendingInvitesForSite( state, site?.ID as number )
	);

	// fetching data config
	const followersFetchOptions = { search };
	const defaultTeamFetchOptions = { include_viewers: true };
	const teamFetchOptions = search
		? {
				search: `*${ search }*`,
				search_columns: [ 'display_name', 'user_login', 'user_email' ],
				...defaultTeamFetchOptions,
		  }
		: defaultTeamFetchOptions;

	const followersQuery = useFollowersQuery(
		site?.ID,
		'all',
		followersFetchOptions
	) as unknown as FollowersQuery;
	const usersQuery = useUsersQuery( site?.ID, teamFetchOptions ) as unknown as UsersQuery;

	return (
		<Main>
			{ isJetpack && isPossibleJetpackConnectionProblem && site?.ID && (
				<JetpackConnectionHealthBanner siteId={ site.ID } />
			) }
			<NavigationHeader
				screenOptionsTab="users.php"
				navigationItems={ [] }
				title={ translate( 'Users' ) }
				subtitle={ translate(
					'Invite team members to your site and manage their access settings. {{learnMore}}Learn more{{/learnMore}}',
					{
						components: {
							learnMore: (
								<InlineSupportLink
									showIcon={ false }
									supportLink={ localizeUrl( 'https://wordpress.com/support/invite-people/' ) }
								/>
							),
						},
					}
				) }
			/>
			<div>
				<SectionNav>
					<PeopleSectionNavCompact
						selectedFilter={ filter }
						searchTerm={ search }
						filterCount={ {
							team: usersQuery.data?.total,
							subscribers: followersQuery.data?.total,
						} }
					/>
				</SectionNav>

				{ ( () => {
					switch ( filter ) {
						case 'subscribers':
							return (
								<>
									<PageViewTracker path="/people/subscribers/:site" title="People > Subscribers" />

									<Subscribers
										filter={ filter }
										search={ search }
										followersQuery={ followersQuery }
									/>
								</>
							);

						case 'team':
							return (
								<>
									<PageViewTracker
										path="/people/team/:site"
										title="People > Team Members / Invites"
									/>

									<TeamInvites singleInviteView />
									<TeamMembers
										search={ search }
										usersQuery={ usersQuery }
										showAddTeamMembersBtn={ ! pendingInvites?.length }
									/>
								</>
							);
					}
				} )() }
			</div>
		</Main>
	);
}

export default SubscribersTeam;
