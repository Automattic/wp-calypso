import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSearch from '../people-section-nav/people-search';

interface Props {
	selectedFilter: string;
	searchTerm?: string;
	filterCount?: { [ key: string ]: undefined | number };
}
function PeopleSectionNavCompact( props: Props ) {
	const _ = useTranslate();
	const { selectedFilter, searchTerm, filterCount } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const filters = [
		{
			id: 'subscribers',
			title: _( 'Subscribers' ),
			path: '/people/subscribers/' + site?.slug,
		},
		{
			id: 'team-members',
			title: _( 'Team' ),
			path: '/people/team-members/' + site?.slug,
		},
	];

	return (
		<>
			<NavTabs>
				{ filters.map( function ( filterItem ) {
					return (
						<NavItem
							key={ filterItem.id }
							path={ filterItem.path }
							selected={ filterItem.id === selectedFilter }
							count={
								filterCount && !! filterCount[ filterItem.id ] && filterCount[ filterItem.id ]
							}
						>
							{ filterItem.title }
						</NavItem>
					);
				} ) }
			</NavTabs>
			<PeopleSearch search={ searchTerm } />
		</>
	);
}

export default PeopleSectionNavCompact;
