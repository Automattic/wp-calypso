import { useTranslate } from 'i18n-calypso';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PeopleSearch from '../people-section-nav/people-search';

interface Props {
	selectedFilter: string;
	searchTerm?: string;
	filterCount?: { [ key: string ]: undefined | number };
}
function PeopleSectionNavCompact( props: Props ) {
	const translate = useTranslate();
	const { selectedFilter, searchTerm, filterCount } = props;
	const site = useSelector( getSelectedSite );
	const searchPlaceholder =
		selectedFilter === 'subscribers' ? translate( 'Search by email…' ) : undefined;

	const filters = [
		{
			id: 'team',
			title: translate( 'Team' ),
			path: '/people/team/' + site?.slug,
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

			<PeopleSearch search={ searchTerm } placeholder={ searchPlaceholder } />
		</>
	);
}

export default PeopleSectionNavCompact;
