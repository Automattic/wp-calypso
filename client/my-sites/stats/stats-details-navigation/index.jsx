import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

const navItems = ( postId, period, statType, givenSiteId ) =>
	[ 'highlights', 'opens', 'clicks' ].map( ( item ) => {
		const pathParam = [ 'opens', 'clicks' ].includes( item )
			? `email/${ item }/${ period }`
			: `post`;
		const attr = {
			key: item,
			path: `/stats/${ pathParam }/${ postId }/${ givenSiteId }`,
			selected: statType === item,
		};

		// uppercase first character of item
		return <NavItem { ...attr }>{ item.charAt( 0 ).toUpperCase() + item.slice( 1 ) }</NavItem>;
	} );

export default function StatsDetailsNavigation( { postId, period, statType, givenSiteId } ) {
	return (
		<SectionNav>
			<NavTabs label="Stats" selectedText="Opens">
				{ navItems( postId, period, statType, givenSiteId ) }
			</NavTabs>
		</SectionNav>
	);
}
