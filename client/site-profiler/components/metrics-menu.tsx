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
	margin-top: 10px;
	margin-bottom: 32px;
`;

interface MetricsMenuProps {
	basicMetricsRef?: React.RefObject< HTMLObjectElement >;
	onCTAClick: () => void;
}

interface MenuItem {
	id: MetricsMenuTabs;
	label: string;
}

enum MetricsMenuTabs {
	basic = 'basic',
}

export const MetricsMenu: React.FC< MetricsMenuProps > = ( props ) => {
	const translate = useTranslate();
	const { basicMetricsRef, onCTAClick } = props;

	const references = {
		[ MetricsMenuTabs.basic ]: basicMetricsRef,
	};

	const menuItems: MenuItem[] = [
		{
			id: MetricsMenuTabs.basic,
			label: translate( 'Performance Metrics' ),
		},
	];

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
					{ menuItems.map( ( item ) => (
						<NavItem
							onClick={ () => onMenuItemClick( item.id ) }
							selected={ selectedTab === item.id }
							key={ item.id }
						>
							{ item.label }
						</NavItem>
					) ) }
				</NavTabs>
				<FullReportButton primary onClick={ onCTAClick }>
					{ translate( "Get full site report - It's free" ) }
				</FullReportButton>
			</SectionNavbar>
		</StickyPanel>
	);
};
