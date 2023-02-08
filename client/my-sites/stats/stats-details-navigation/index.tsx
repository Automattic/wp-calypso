import PropTypes from 'prop-types';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

interface propTypes {
	postId: number;
	period?: string;
	statType?: string;
	givenSiteId: number;
}
const navItems = (
	postId: number,
	period: string | undefined = 'day',
	statType: string | undefined,
	givenSiteId: number
) =>
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

function StatsDetailsNavigation( { postId, period, statType, givenSiteId }: propTypes ) {
	return (
		<SectionNav>
			<NavTabs label="Stats">{ navItems( postId, period, statType, givenSiteId ) }</NavTabs>
		</SectionNav>
	);
}

StatsDetailsNavigation.propTypes = {
	postId: PropTypes.number.isRequired,
	period: PropTypes.string,
	statType: PropTypes.string,
	givenSiteId: PropTypes.number.isRequired,
};

export default StatsDetailsNavigation;
