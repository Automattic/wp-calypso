import { useTranslate } from 'i18n-calypso';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

interface Props {
	selectedFilter: string;
}
function PeopleSectionAddNav( props: Props ) {
	const translate = useTranslate();
	const { selectedFilter } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );

	const filters = [
		{
			id: 'team',
			title: translate( 'Add to team' ),
			path: '/people/new/' + site?.slug,
		},
		{
			id: 'subscribers',
			title: translate( 'Add subscribers' ),
			path: '/people/add-subscribers/' + site?.slug,
		},
	];

	return (
		<SectionNav className="people-section-add-nav">
			<NavTabs selectedText={ selectedFilter }>
				{ filters.map( function ( filterItem ) {
					return (
						<NavItem
							key={ filterItem.id }
							path={ filterItem.path }
							selected={ filterItem.id === selectedFilter }
						>
							{ filterItem.title }
						</NavItem>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
}

export default PeopleSectionAddNav;
