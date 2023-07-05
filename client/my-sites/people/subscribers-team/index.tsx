import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import SectionNav from 'calypso/components/section-nav';
import useUsersQuery from 'calypso/data/users/use-users-query';
import useRemoveViewer from 'calypso/data/viewers/use-remove-viewer-mutation';
import useViewersQuery from 'calypso/data/viewers/use-viewers-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSelector } from 'calypso/state';
import { getPendingInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSectionNavCompact from '../people-section-nav-compact';
import TeamInvites from '../team-invites';
import TeamMembers from '../team-members';
import Viewers from '../viewers-list/viewers';
import type { UsersQuery } from '../team-members/types';

interface Props {
	filter: string;
	search?: string;
}
function SubscribersTeam( props: Props ) {
	const translate = useTranslate();
	const { filter, search } = props;
	const site = useSelector( ( state ) => {
		const selectedSite = getSelectedSite( state );

		return selectedSite as NonNullable< typeof selectedSite >;
	} );
	const isPrivateSite = site.is_private ?? false;
	const pendingInvites = useSelector( ( state ) =>
		getPendingInvitesForSite( state, site?.ID as number )
	);
	const { removeViewer } = useRemoveViewer();

	const teamFetchOptions = search
		? {
				search: `*${ search }*`,
				search_columns: [ 'display_name', 'user_login', 'user_email' ],
		  }
		: {};

	const viewersQuery = useViewersQuery( site.ID, undefined, { enabled: isPrivateSite } );
	const usersQuery = useUsersQuery( site.ID, teamFetchOptions ) as UsersQuery;

	const totalViewers = viewersQuery.data?.total ?? 0;

	return (
		<Main>
			<ScreenOptionsTab wpAdminPath="users.php" />
			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ translate( 'Users' ) }
				subHeaderText={ translate(
					'Invite team members to your site and manage their access settings. {{learnMore}}Learn more{{/learnMore}}.',
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
						shouldDisplayViewersTab={ isPrivateSite }
						selectedFilter={ filter }
						searchTerm={ search }
						filterCount={ {
							team: usersQuery.data?.total,
							viewers: totalViewers,
						} }
					/>
				</SectionNav>

				{ ( () => {
					switch ( filter ) {
						case 'viewers':
							return (
								<>
									<PageViewTracker path="/people/viewers/:site" title="People > Viewers" />

									<Viewers
										label={ translate(
											'You have %(number)d viewer',
											'You have %(number)d viewers',
											{
												args: { number: totalViewers },
												count: totalViewers,
											}
										) }
										site={ site }
										viewers={ viewersQuery.data?.viewers ?? [] }
										isFetching={ viewersQuery.isFetching }
										fetchNextPage={ viewersQuery.fetchNextPage }
										hasNextPage={ viewersQuery.hasNextPage }
										isFetchingNextPage={ viewersQuery.isFetchingNextPage }
										removeViewer={ removeViewer }
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
