import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import SectionNav from 'calypso/components/section-nav';
import useFollowersQuery from 'calypso/data/followers/use-followers-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSectionNavCompact from '../people-section-nav-compact';
import Subscribers from '../subscribers';
import type { FollowersQuery } from '../subscribers/types';
import type { UsersQuery } from '../team-members/types';

interface Props {
	filter: string;
	search?: string;
}
function SubscribersTeam( props: Props ) {
	const _ = useTranslate();
	const { filter, search } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	// fetching data config
	const followersFetchOptions = { search };
	const teamFetchOptions = {
		...followersFetchOptions,
		search_columns: [ 'display_name', 'user_login' ],
	};
	const followersQuery = useFollowersQuery(
		site?.ID,
		'all',
		followersFetchOptions
	) as unknown as FollowersQuery;
	const usersQuery = useUsersQuery( site?.ID, teamFetchOptions ) as unknown as UsersQuery;

	return (
		<Main>
			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ _( 'Users' ) }
				subHeaderText={ _(
					'Invite subscribers and team members to your site and manage their access settings.'
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
							subscribers: followersQuery.data?.total,
							'team-members': usersQuery.data?.total,
						} }
					/>
				</SectionNav>

				{ ( () => {
					switch ( filter ) {
						case 'subscribers':
							return (
								<Subscribers
									filter={ filter }
									search={ search }
									followersQuery={ followersQuery }
								/>
							);
					}
				} )() }
			</div>
		</Main>
	);
}

export default SubscribersTeam;
