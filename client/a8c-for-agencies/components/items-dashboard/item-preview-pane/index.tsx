import classNames from 'classnames';
import React, { useState } from 'react';
import { GuidedTourStep } from 'calypso/a8c-for-agencies/components/guided-tour-step';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SitePreviewPaneHeader from './site-preview-pane-header';
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
	closeSitePreviewPane,
	className,
	itemTitle,
	itemSubtitle,
	itemUrl,
	itemColor,
	itemIcon,
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
		<div className={ classNames( 'site-preview__pane', className ) }>
			<SitePreviewPaneHeader
				closeSitePreviewPane={ closeSitePreviewPane }
				itemTitle={ itemTitle }
				itemSubtitle={ itemSubtitle }
				itemUrl={ itemUrl }
				itemColor={ itemColor }
				itemIcon={ itemIcon }
			/>
			<div ref={ setNavRef }>
				<SectionNav className="preview-pane__navigation" selectedText={ selectedFeature.tab.label }>
					{ navItems && navItems.length > 0 ? (
						<NavTabs hasHorizontalScroll={ true }>{ navItems }</NavTabs>
					) : null }
				</SectionNav>
			</div>
			<GuidedTourStep
				id="sites-walkthrough-site-preview-tabs"
				tourId="sitesWalkthrough"
				context={ navRef }
			/>
			{ selectedFeature.preview }
		</div>
	);
}
