import PropTypes from 'prop-types';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

interface propTypes {
	postId: number;
	period?: string;
	statType?: string;
	givenSiteId: string | number;
}

const tabs = { highlights: 'Highlights', opens: 'Email opens', clicks: 'Email clicks' };

const navItems = (
	postId: number,
	period: string | undefined = 'day',
	statType: string | undefined,
	givenSiteId: string | number
) => {
	return Object.keys( tabs ).map( ( item ) => {
		const selected = statType ? statType === item : 'highlights' === item;
		const pathParam = [ 'opens', 'clicks' ].includes( item )
			? `email/${ item }/${ period }`
			: `post`;
		const attr = {
			key: item,
			path: `/stats/${ pathParam }/${ postId }/${ givenSiteId }`,
			selected,
		};
		const label = tabs[ item as keyof typeof tabs ];

		// uppercase first character of item
		return <NavItem { ...attr }>{ label }</NavItem>;
	} );
};

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
	givenSiteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
};

export default StatsDetailsNavigation;
