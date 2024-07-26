import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useMemo, useState } from 'react';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer-v2';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { useURLQueryParams } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import EnterpriseAgencyHosting from './enterprise-agency-hosting';
import PremierAgencyHosting from './premier-agency-hosting';
import StandardAgencyHosting from './standard-agency-hosting';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function HostingV2( { onAddToCart }: Props ) {
	const translate = useTranslate();

	const isLargeScreen = useBreakpoint( '>1280px' );

	const { setParams, getParamValue } = useURLQueryParams();

	const [ selectedFeatureId, setSelectedFeatureId ] = useState< string >(
		getParamValue( 'hosting' )
	);

	useLayoutEffect( () => {
		if ( ! selectedFeatureId ) {
			setParams( [
				{
					key: 'hosting',
					value: 'standard',
				},
			] );
			setSelectedFeatureId( 'standard' );
		}
	}, [ selectedFeatureId, setParams ] );

	const featureTabs = useMemo(
		() => [
			{
				key: 'standard',
				label: isLargeScreen ? translate( 'Standard Agency Hosting' ) : translate( 'Standard' ),
				subtitle: isLargeScreen && translate( 'Optimized and hassle-free hosting' ),
				visible: true,
				selected: selectedFeatureId === 'standard',
				onClick: () => {
					setSelectedFeatureId( 'standard' );
					page.show( '/marketplace/hosting?hosting=standard' );
				},
				content: <StandardAgencyHosting onAddToCart={ onAddToCart } />,
			},
			{
				key: 'premier',
				label: isLargeScreen ? translate( 'Premier Agency Hosting' ) : translate( 'Premier' ),
				subtitle: isLargeScreen && translate( 'Best for large-scale businesses' ),
				visible: true,
				selected: selectedFeatureId === 'premier',
				onClick: () => {
					setSelectedFeatureId( 'premier' );
					page.show( '/marketplace/hosting?hosting=premier' );
				},
				content: <PremierAgencyHosting />,
			},
			{
				key: 'enterprise',
				label: translate( 'Enterprise' ),
				subtitle: isLargeScreen && translate( 'WordPress for enterprise-level demands' ),
				visible: true,
				selected: selectedFeatureId === 'enterprise',
				onClick: () => {
					setSelectedFeatureId( 'enterprise' );
					page.show( '/marketplace/hosting?hosting=enterprise' );
				},
				content: <EnterpriseAgencyHosting />,
			},
		],
		[ isLargeScreen, selectedFeatureId, translate ]
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

	const selectedFeature = featureTabs.find( ( featureTab ) => featureTab.selected );

	return (
		<div className="hosting-v2">
			<div
				className={ clsx( 'hosting-v2__hero', {
					'is-standard': selectedFeatureId === 'standard',
					'is-premier': selectedFeatureId === 'premier',
					'is-enterprise': selectedFeatureId === 'enterprise',
				} ) }
			>
				<div className="hosting-v2__container">
					<div className="hosting-v2__heading">
						{ translate( "Choose the hosting tailored{{br/}}for your client's needs.", {
							components: {
								br: <br />,
							},
						} ) }
					</div>
					<MigrationOffer />
					<NavTabs>{ navItems }</NavTabs>
				</div>
			</div>
			{ selectedFeature && <div className="hosting-v2__content">{ selectedFeature.content }</div> }
		</div>
	);
}
