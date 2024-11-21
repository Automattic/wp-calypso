import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

interface propTypes {
	postId: number;
	period?: string;
	statType?: string;
	givenSiteId: string | number;
}

function StatsDetailsNavigation( { postId, period, statType, givenSiteId }: propTypes ) {
	const translate = useTranslate();
	const tabs = useMemo(
		() => ( {
			highlights: translate( 'Highlights' ),
			opens: translate( 'Email opens' ),
			clicks: translate( 'Email clicks' ),
		} ),
		[ translate ]
	) as { [ key: string ]: string };

	const selectedTab = statType ? statType : 'highlights';

	const navItems = useCallback(
		( postId: number, period: string | undefined = 'day', givenSiteId: string | number ) => {
			return Object.keys( tabs ).map( ( item ) => {
				const selected = selectedTab === item;
				const pathParam = [ 'opens', 'clicks' ].includes( item )
					? `email/${ item }/${ period }`
					: `post`;
				const attr = {
					path: `/stats/${ pathParam }/${ postId }/${ givenSiteId }`,
					selected,
				};
				const label = tabs[ item as keyof typeof tabs ];

				// uppercase first character of item
				return (
					<NavItem key={ item } { ...attr }>
						{ label }
					</NavItem>
				);
			} );
		},
		[ tabs, selectedTab ]
	);

	return (
		<SectionNav selectedText={ tabs[ selectedTab ] }>
			<NavTabs label="Stats">{ navItems( postId, period, givenSiteId ) }</NavTabs>
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
