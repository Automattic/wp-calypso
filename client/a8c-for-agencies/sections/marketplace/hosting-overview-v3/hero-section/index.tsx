import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { SectionProps } from '..';

import './style.scss';

type Props = SectionProps & {
	onSectionChange: ( section: 'wpcom' | 'pressable' | 'vip' ) => void;
};

export default function HeroSection( { section, onSectionChange }: Props ) {
	const translate = useTranslate();

	const isLargeScreen = useBreakpoint( '>1280px' );

	const featureTabs = useMemo(
		() => [
			{
				key: 'wpcom',
				label: isLargeScreen ? translate( 'Standard Agency Hosting' ) : translate( 'Standard' ),
				subtitle: isLargeScreen && translate( 'Optimized and hassle-free hosting' ),
				visible: true,
				selected: section === 'wpcom',
				onClick: () => {
					onSectionChange( 'wpcom' );
				},
			},
			{
				key: 'pressable',
				label: isLargeScreen ? translate( 'Premier Agency Hosting' ) : translate( 'Premier' ),
				subtitle: isLargeScreen && translate( 'Best for large-scale businesses' ),
				visible: true,
				selected: section === 'pressable',
				onClick: () => {
					onSectionChange( 'pressable' );
				},
			},
			{
				key: 'vip',
				label: translate( 'Enterprise' ),
				subtitle: isLargeScreen && translate( 'WordPress for enterprise-level demands' ),
				visible: true,
				selected: section === 'vip',
				onClick: () => {
					onSectionChange( 'vip' );
				},
			},
		],
		[ onSectionChange, isLargeScreen, section, translate ]
	);

	const navItems = featureTabs.map( ( featureTab ) => {
		if ( ! featureTab.visible ) {
			return null;
		}
		return (
			<NavItem
				key={ featureTab.key }
				selected={ featureTab.selected }
				onClick={ featureTab.onClick }
			>
				{ featureTab.label && (
					<div className="hosting-v3__nav-item-label">{ featureTab.label }</div>
				) }
				{ featureTab.subtitle && (
					<div className="hosting-v3__nav-item-subtitle">{ featureTab.subtitle }</div>
				) }
			</NavItem>
		);
	} );

	return (
		<div className="hosting-v3-hero-section">
			<div className="hosting-v3-hero-section__heading">
				{ translate(
					'High Performance, Highly-Secure{{br/}}Managed WordPress Hosting for Agencies',
					{
						components: {
							br: <br />,
						},
					}
				) }
			</div>
			<NavTabs enforceTabsView>{ navItems }</NavTabs>
		</div>
	);
}
