import clsx from 'clsx';
import React, { useState } from 'react';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import ItemViewContent from './item-view-content';
import ItemViewHeader from './item-view-header';
import { FeaturePreviewInterface, ItemViewProps } from './types';

import './style.scss';

export const createFeaturePreview = (
	id: string,
	label: string | React.ReactNode,
	enabled: boolean,
	selectedFeatureId: string | undefined,
	setSelectedFeatureId: ( id: string ) => void,
	preview: React.ReactNode
): FeaturePreviewInterface => {
	return {
		id,
		tab: {
			label,
			visible: enabled,
			selected: enabled && selectedFeatureId === id,
			onTabClick: () => enabled && setSelectedFeatureId( id ),
		},
		enabled,
		preview: enabled ? preview : null,
	};
};

export default function ItemView( {
	features,
	closeItemView,
	className,
	itemData,
	addTourDetails,
	itemViewHeaderExtraProps,
	hideNavIfSingleTab,
	enforceTabsView,
}: ItemViewProps ) {
	const [ navRef, setNavRef ] = useState< HTMLElement | null >( null );

	// Ensure we have features
	if ( ! features || ! features.length ) {
		return null;
	}

	// Find the selected feature or default to the first feature
	const selectedFeature = features.find( ( feature ) => feature.tab.selected ) || features[ 0 ];

	// Ensure we have a valid feature
	if ( ! selectedFeature ) {
		return null;
	}

	// Extract the tabs from the features
	const featureTabs = features.map( ( feature ) => ( {
		key: feature.id,
		label: feature.tab.label,
		selected: feature.tab.selected,
		onClick: feature.tab.onTabClick,
		visible: feature.tab.visible,
	} ) );

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
				{ featureTab.label }
			</NavItem>
		);
	} );

	const isMobileApp = isWpMobileApp();

	const shouldHideNav = ( hideNavIfSingleTab && featureTabs.length <= 1 ) || isMobileApp;

	return (
		<div className={ clsx( 'multi-sites-dashboard-item-view', className ) }>
			<ItemViewHeader
				closeItemView={ closeItemView }
				itemData={ itemData }
				isPreviewLoaded={ !! selectedFeature.preview }
				extraProps={ itemViewHeaderExtraProps }
			/>
			<div ref={ setNavRef }>
				<SectionNav
					className={ clsx( 'multi-sites-dashboard-item-view__navigation', {
						'is-hidden': shouldHideNav,
					} ) }
					selectedText={ selectedFeature.tab.label }
					enforceTabsView={ enforceTabsView }
				>
					{ navItems && navItems.length > 0 ? (
						<NavTabs hasHorizontalScroll>{ navItems }</NavTabs>
					) : null }
				</SectionNav>
			</div>
			{ addTourDetails && (
				<GuidedTourStep
					id={ addTourDetails.id }
					tourId={ addTourDetails.tourId }
					context={ navRef }
				/>
			) }
			<ItemViewContent>{ selectedFeature.preview }</ItemViewContent>
		</div>
	);
}
