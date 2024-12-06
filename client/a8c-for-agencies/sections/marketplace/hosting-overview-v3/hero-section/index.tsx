import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import MigrationOfferV3 from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v3';
import NavItem from 'calypso/components/section-nav/item';
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
				selected: section === 'wpcom',
				onClick: () => {
					onSectionChange( 'wpcom' );
				},
			},
			{
				key: 'pressable',
				label: isLargeScreen ? translate( 'Premier Agency Hosting' ) : translate( 'Premier' ),
				subtitle: isLargeScreen && translate( 'Best for large-scale businesses' ),
				selected: section === 'pressable',
				onClick: () => {
					onSectionChange( 'pressable' );
				},
			},
			{
				key: 'vip',
				label: translate( 'Enterprise' ),
				subtitle: isLargeScreen && translate( 'WordPress for enterprise-level demands' ),
				selected: section === 'vip',
				onClick: () => {
					onSectionChange( 'vip' );
				},
			},
		],
		[ onSectionChange, isLargeScreen, section, translate ]
	);

	const navItems = featureTabs.map( ( featureTab ) => {
		return (
			<NavItem
				className="hosting-v3-hero-section__tab"
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

			<MigrationOfferV3 />

			<ul className="hosting-v3-hero-section__tabs">
				{ navItems.map( ( item ) => {
					return <li key={ item.key }>{ item }</li>;
				} ) }
			</ul>
		</div>
	);
}
