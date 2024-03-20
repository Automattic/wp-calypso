import classNames from 'classnames';
import React from 'react';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SitePreviewPaneHeader from './site-preview-pane-header';
import { FeaturePreviewInterface, SitePreviewPaneProps } from './types';

import './style.scss';

export const createFeaturePreview = (
	id: string,
	label: string,
	enabled: boolean,
	selectedFeatureId: string,
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

export default function SitePreviewPane( {
	site,
	features,
	closeSitePreviewPane,
	className,
}: SitePreviewPaneProps ) {
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
		path: null,
		onClick: feature.tab.onTabClick,
		children: [],
		visible: feature.tab.visible,
	} ) );

	const navItems = featureTabs.map( ( featureTab ) => (
		<NavItem { ...featureTab }>{ featureTab.label }</NavItem>
	) );

	return (
		<div className={ classNames( 'site-preview__pane', className ) }>
			<SitePreviewPaneHeader site={ site } closeSitePreviewPane={ closeSitePreviewPane } />
			{ navItems && navItems.length > 0 ? (
				<SectionNav className="preview-pane__navigation" selectedText={ selectedFeature.tab.label }>
					<NavTabs selectedText={ selectedFeature.tab.label }>{ navItems }</NavTabs>
				</SectionNav>
			) : null }
			{ selectedFeature.preview }
		</div>
	);
}
