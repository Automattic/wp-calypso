import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { forwardRef, useMemo } from 'react';
import NavItem from 'calypso/components/section-nav/item';
import { preventWidows } from 'calypso/lib/formatting';
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
				className="hosting-hero-section__tab"
				key={ featureTab.key }
				selected={ featureTab.selected }
				onClick={ featureTab.onClick }
			>
				{ featureTab.label && <div className="hosting__nav-item-label">{ featureTab.label }</div> }
				{ featureTab.subtitle && (
					<div className="hosting__nav-item-subtitle">{ featureTab.subtitle }</div>
				) }
			</NavItem>
		);
	} );

	return (
		<div className={ clsx( 'hosting-hero-section', { 'is-compact': isCompact } ) } ref={ ref }>
			<div className="hosting-hero-section__content">
				<div className="hosting-hero-section__heading">
					{ preventWidows(
						translate(
							'High Performance, Highly-Secure{{br/}}Managed WordPress Hosting for Agencies',
							{
								components: {
									br: <br />,
								},
							}
						)
					) }
				</div>
			</div>

			<ul className="hosting-hero-section__tabs">{ navItems }</ul>
		</div>
	);
}

export default forwardRef( HeroSection );
