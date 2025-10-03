import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useMemo } from 'react';

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
				// Skip navigation if the clicked tab is already active to avoid redundant actions.
				if ( tabName !== selectedTab ) {
					const tab = tabPanelTabs.find( ( tab ) => tab.name === tabName );
					if ( tab?.path ) {
						page( tab.path );
					}
				}
			} }
		>
			{ () => null /* Placeholder div since content is rendered elsewhere */ }
		</TabPanel>
	);
}

function StatsDetailsNavigation( props: StatsDetailsNavigationProps ) {
	return <StatsDetailsNavigationImproved { ...props } />;
}

StatsDetailsNavigation.propTypes = {
	postId: PropTypes.number.isRequired,
	period: PropTypes.string,
	statType: PropTypes.string,
	givenSiteId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
};

export default StatsDetailsNavigation;
