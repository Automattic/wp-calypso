import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useCallback, useContext } from 'react';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v2';
import { A4A_MARKETPLACE_HOSTING_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';
import VIPLogo from 'calypso/assets/images/a8c-for-agencies/vip-full-logo.svg';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { MarketplaceTypeContext } from '../../context';
import EnterpriseAgencyHosting from './enterprise-agency-hosting';
import PremierAgencyHosting from './premier-agency-hosting';
import StandardAgencyHosting from './standard-agency-hosting';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
	section: 'wpcom' | 'pressable' | 'vip';
};

const HostingContent = ( { section, onAddToCart }: Props ) => {
	const translate = useTranslate();

	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const isReferMode = marketplaceType === 'referral';

	let content;
	let logo;
	let title;
	if ( section === 'wpcom' ) {
		content = <StandardAgencyHosting onAddToCart={ onAddToCart } />;
		logo = <img src={ WPCOMLogo } alt="WPCOM" />;
		title = translate(
			'Optimized and hassle-free hosting for business websites, local merchants, and small online retailers.'
		);
	}
	if ( section === 'pressable' ) {
		content = <PremierAgencyHosting onAddToCart={ ( product ) => onAddToCart( product, 1 ) } />;
		logo = <img src={ PressableLogo } alt="Pressable" />;
		title = translate(
			'Premier Agency hosting best for large-scale businesses and major eCommerce sites.'
		);
	}
	if ( section === 'vip' ) {
		content = <EnterpriseAgencyHosting isReferMode={ isReferMode } />;
		logo = <img src={ VIPLogo } alt="VIP" />;
		title = translate(
			'Deliver unmatched performance with the highest security standards on our enterprise content platform.'
		);
	}
	return (
		<div className="hosting-v2__content">
			<div className="hosting-v2__content-header">
				<div className="hosting-v2__content-logo">{ logo }</div>
				<div className="hosting-v2__content-header-title">{ title }</div>
			</div>
			{ content }
		</div>
	);
};

export default function HostingV2( { onAddToCart, section }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isLargeScreen = useBreakpoint( '>1280px' );

	const handleTabClick = useCallback(
		( tab: string ) => {
			page.show( `${ A4A_MARKETPLACE_HOSTING_LINK }/${ tab }` );
			dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_tab_click', { tab } ) );
		},
		[ dispatch ]
	);

	const featureTabs = useMemo(
		() => [
			{
				key: 'wpcom',
				label: isLargeScreen ? translate( 'Standard Agency Hosting' ) : translate( 'Standard' ),
				subtitle: isLargeScreen && translate( 'Optimized and hassle-free hosting' ),
				visible: true,
				selected: section === 'wpcom',
				onClick: () => {
					handleTabClick( 'wpcom' );
				},
			},
			{
				key: 'pressable',
				label: isLargeScreen ? translate( 'Premier Agency Hosting' ) : translate( 'Premier' ),
				subtitle: isLargeScreen && translate( 'Best for large-scale businesses' ),
				visible: true,
				selected: section === 'pressable',
				onClick: () => {
					handleTabClick( 'pressable' );
				},
			},
			{
				key: 'vip',
				label: translate( 'Enterprise' ),
				subtitle: isLargeScreen && translate( 'WordPress for enterprise-level demands' ),
				visible: true,
				selected: section === 'vip',
				onClick: () => {
					handleTabClick( 'vip' );
				},
			},
		],
		[ handleTabClick, isLargeScreen, section, translate ]
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
					<div className="hosting-v2__nav-item-label">{ featureTab.label }</div>
				) }
				{ featureTab.subtitle && (
					<div className="hosting-v2__nav-item-subtitle">{ featureTab.subtitle }</div>
				) }
			</NavItem>
		);
	} );

	return (
		<div className="hosting-v2">
			<div className="hosting-v2__hero-container">
				<div
					className={ clsx( 'hosting-v2__hero', {
						'is-standard': section === 'wpcom',
						'is-premier': section === 'pressable',
						'is-enterprise': section === 'vip',
					} ) }
				>
					<div className="hosting-v2__hero-content">
						<div className="hosting-v2__heading">
							{ translate(
								'High Performance, Highly Secure{{br/}}Managed WordPress Hosting for Agencies',
								{
									components: {
										br: <br />,
									},
								}
							) }
						</div>
						<MigrationOffer />
						<NavTabs enforceTabsView>{ navItems }</NavTabs>
					</div>
				</div>
			</div>
			{ section && <HostingContent section={ section } onAddToCart={ onAddToCart } /> }
		</div>
	);
}
