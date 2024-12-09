import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import MigrationOfferV3 from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v3';
import NavItem from 'calypso/components/section-nav/item';
import { SectionProps } from '..';

import './style.scss';

type Props = SectionProps & {
	onSectionChange: ( section: 'wpcom' | 'pressable' | 'vip' ) => void;
	isCompact?: boolean;
};

export function HeroSection(
	{ section, onSectionChange, isCompact }: Props,
	ref: React.Ref< HTMLDivElement >
) {
	const translate = useTranslate();

	const isLargeScreen = useBreakpoint( '>1280px' );

	const [ isMigrationOfferExpanded, setIsMigrationOfferExpanded ] = useState( false );

	const onToggleMigrationOfferView = useCallback( () => {
		setIsMigrationOfferExpanded( ( isExpanded ) => ! isExpanded );
	}, [] );

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

	useEffect( () => {
		if ( isCompact ) {
			setIsMigrationOfferExpanded( false );
		}
	}, [ isCompact ] );

	return (
		<div className={ clsx( 'hosting-v3-hero-section', { 'is-compact': isCompact } ) } ref={ ref }>
			<div className="hosting-v3-hero-section__content">
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

				<MigrationOfferV3
					isExpanded={ isMigrationOfferExpanded }
					onToggleView={ onToggleMigrationOfferView }
				/>
			</div>

			<ul className="hosting-v3-hero-section__tabs">{ navItems }</ul>
		</div>
	);
}

export default forwardRef( HeroSection );
