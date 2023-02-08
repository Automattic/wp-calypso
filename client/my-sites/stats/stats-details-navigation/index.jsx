import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

const navItems = ( postId, period, statType, givenSiteId ) =>
	[ 'highlights', 'opens', 'clicks' ].map( ( item ) => {
		const selected = statType ? statType === item : 'highlights' === item;
		const pathParam = [ 'opens', 'clicks' ].includes( item )
			? `email/${ item }/${ period }`
			: `post`;
		const attr = {
			key: item,
			path: `/stats/${ pathParam }/${ postId }/${ givenSiteId }`,
			selected,
		};

		// uppercase first character of item
		return <NavItem { ...attr }>{ item.charAt( 0 ).toUpperCase() + item.slice( 1 ) }</NavItem>;
	} );

export default function StatsDetailsNavigation( {
	postId,
	period = 'day',
	statType,
	givenSiteId,
} ) {
	return (
		<SectionNav>
			<NavTabs label="Stats">{ navItems( postId, period, statType, givenSiteId ) }</NavTabs>
		</SectionNav>
	);
}
