import clsx from 'clsx';
import React, { useState } from 'react';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import ItemPreviewPaneContent from './item-preview-pane-content';
import ItemPreviewPaneHeader from './item-preview-pane-header';
import { FeaturePreviewInterface, PreviewPaneProps } from './types';

import './style.scss';

export const createFeaturePreview = (
	id: string,
	label: string,
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

export default function ItemPreviewPane( {
	features,
	closeItemPreviewPane,
	className,
	itemData,
	addTourDetails,
	itemPreviewPaneHeaderExtraProps,
}: PreviewPaneProps ) {
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

	return (
		<div className={ clsx( 'item-preview__pane', className ) }>
			<ItemPreviewPaneHeader
				closeItemPreviewPane={ closeItemPreviewPane }
				itemData={ itemData }
				extraProps={ itemPreviewPaneHeaderExtraProps }
			/>
			<div ref={ setNavRef }>
				<SectionNav className="preview-pane__navigation" selectedText={ selectedFeature.tab.label }>
					{ navItems && navItems.length > 0 ? (
						<NavTabs hasHorizontalScroll={ true }>{ navItems }</NavTabs>
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
			<ItemPreviewPaneContent>{ selectedFeature.preview }</ItemPreviewPaneContent>
		</div>
	);
}
