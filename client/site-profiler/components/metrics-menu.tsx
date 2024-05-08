import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import StickyPanel from 'calypso/components/sticky-panel';
import { useIsMenuSectionVisible } from '../hooks/use-is-menu-section-visible';

const FullReportButton = styled( Button )`
	margin-right: 8px;
	border-radius: 4px;
	box-shadow: 0px 1px 2px 0px rgba( 0, 0, 0, 0.05 );
`;

const SectionNavbar = styled( SectionNav )`
	margin-bottom: 32px;
`;

interface MetricsMenuProps {
	basicMetricsRef?: React.RefObject< HTMLObjectElement >;
}

enum MetricsMenuTabs {
	basic = 'basic',
}

export const MetricsMenu: React.FC< MetricsMenuProps > = ( props: MetricsMenuProps ) => {
	const translate = useTranslate();
	const { basicMetricsRef } = props;

	const references = {
		[ MetricsMenuTabs.basic ]: basicMetricsRef,
	};

	const [ selectedTab, setSelectedTab ] = useState< MetricsMenuTabs | undefined >();
	const basicMetricsVisible = useIsMenuSectionVisible( basicMetricsRef );

	useEffect( () => {
		if ( basicMetricsVisible ) {
			setSelectedTab( MetricsMenuTabs.basic );
		} else {
			setSelectedTab( undefined );
		}
	}, [ basicMetricsVisible ] );

	const onMenuItemClick = ( tab: MetricsMenuTabs ) => {
		if ( references[ tab ]?.current ) {
			references[ tab ]?.current?.scrollIntoView( { behavior: 'smooth' } );
		}
	};

	return (
		<StickyPanel>
			<SectionNavbar className="metrics-menu-navbar">
				<NavTabs>
					<NavItem
						onClick={ () => onMenuItemClick( MetricsMenuTabs.basic ) }
						selected={ selectedTab === MetricsMenuTabs.basic }
					>
						{ translate( 'Basic Performance Metrics' ) }
					</NavItem>
				</NavTabs>
				<FullReportButton primary>
					{ translate( "Get full site report - It's free" ) }
				</FullReportButton>
			</SectionNavbar>
		</StickyPanel>
	);
};
