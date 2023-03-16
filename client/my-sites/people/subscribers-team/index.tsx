import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SectionNav from 'calypso/components/section-nav';
import useFollowersQuery from 'calypso/data/followers/use-followers-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FollowersList from 'calypso/my-sites/people/followers-list';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSectionNavCompact from '../people-section-nav-compact';
import Subscribers from '../subscribers';
import TeamInvites from '../team-invites';
import TeamMembers from '../team-members';
import type { FollowersQuery } from '../subscribers/types';
import type { UsersQuery } from '../team-members/types';

interface Props {
	filter: string;
	search?: string;
}
function SubscribersTeam( props: Props ) {
	const translate = useTranslate();
	const { filter, search } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );
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
			<ScreenOptionsTab wpAdminPath="users.php" />
			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ translate( 'Users' ) }
				subHeaderText={ translate(
					'Invite subscribers and team members to your site and manage their access settings. {{learnMore}}Learn more{{/learnMore}}.',
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
				align="left"
				hasScreenOptions
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
						case 'email-followers':
							return (
								<>
									<PageViewTracker
										path="/people/email-followers/:site"
										title="People > Subscribers"
									/>
									<FollowersList site={ site } search={ search } type="email" />
								</>
							);

						case 'followers':
							return (
								<>
									<PageViewTracker path="/people/followers/:site" title="People > Subscribers" />
									<FollowersList site={ site } search={ search } />
								</>
							);

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

									<TeamInvites singleInviteView={ true } />
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
