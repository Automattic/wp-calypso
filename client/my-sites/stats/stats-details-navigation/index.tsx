import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';

interface StatsDetailsNavigationProps {
	postId: number;
	period?: string;
	statType?: string;
	givenSiteId: string | number;
}

function StatsDetailsNavigationImproved( {
	postId,
	period,
	statType,
	givenSiteId,
}: StatsDetailsNavigationProps ) {
	const translate = useTranslate();
	const tabs = useMemo(
		() => ( {
			highlights: translate( 'Post traffic' ),
			opens: translate( 'Email opens' ),
			clicks: translate( 'Email clicks' ),
		} ),
		[ translate ]
	) as { [ key: string ]: string };

	const selectedTab = statType ? statType : 'highlights';

	const tabPanelTabs = useMemo(
		() =>
			Object.keys( tabs ).map( ( item ) => {
				const pathParam = [ 'opens', 'clicks' ].includes( item )
					? `email/${ item }/${ period || 'day' }`
					: 'post';
				return {
					name: item,
					title: tabs[ item as keyof typeof tabs ],
					className: `stats-navigation__${ item }`,
					path: `/stats/${ pathParam }/${ postId }/${ givenSiteId }`,
				};
			} ),
		[ tabs, postId, period, givenSiteId ]
	);

	return (
		<TabPanel
			className="stats-navigation__tabs"
			tabs={ tabPanelTabs }
			initialTabName={ selectedTab }
			onSelect={ ( tabName ) => {
				const tab = tabPanelTabs.find( ( tab ) => tab.name === tabName );
				if ( tab?.path ) {
					page( tab.path );
				}
			} }
		>
			{ () => null /* Placeholder div since content is rendered elsewhere */ }
		</TabPanel>
	);
}

function StatsDetailsNavigationLegacy( {
	postId,
	period,
	statType,
	givenSiteId,
}: StatsDetailsNavigationProps ) {
	const translate = useTranslate();
	const tabs = useMemo(
		() => ( {
			highlights: translate( 'Post traffic' ),
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
					: 'post';
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

function StatsDetailsNavigation( props: StatsDetailsNavigationProps ) {
	if ( config.isEnabled( 'stats/navigation-improvement' ) ) {
		return <StatsDetailsNavigationImproved { ...props } />;
	}
	return <StatsDetailsNavigationLegacy { ...props } />;
}

StatsDetailsNavigation.propTypes = {
	postId: PropTypes.number.isRequired,
	period: PropTypes.string,
	statType: PropTypes.string,
	givenSiteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
};

export default StatsDetailsNavigation;
