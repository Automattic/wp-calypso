import classNames from 'classnames';
import React from 'react';
import SitePreviewPaneHeader from './site-preview-pane-header';
import SitePreviewPaneTabs from './site-preview-pane-tabs';
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
	const featureTabs = features.map( ( feature ) => feature.tab );

	return (
		<div className={ classNames( 'site-preview__pane', className ) }>
			<SitePreviewPaneHeader site={ site } closeSitePreviewPane={ closeSitePreviewPane } />
			<SitePreviewPaneTabs featureTabs={ featureTabs } />
			{ selectedFeature.preview }
		</div>
	);
}
