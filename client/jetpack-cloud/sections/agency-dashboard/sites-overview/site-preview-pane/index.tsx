import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
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

export default function SitePreviewPane( {
	site,
	features,
	closeSitePreviewPane,
	className,
}: SitePreviewPaneProps ) {
	const [ canDisplayNavTabs, setCanDisplayNavTabs ] = useState( false );

	// For future iterations lets consider something other than SectionNav due to the
	// manipulation we need to make so that the navigation shows correctly on some smaller
	// screens within the PreviewPane (hence the timeout).
	useEffect( () => {
		setTimeout( () => {
			setCanDisplayNavTabs( true );
		}, 150 );
	}, [] );

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
		<div className={ clsx( 'site-preview__pane', className ) }>
			<SitePreviewPaneHeader site={ site } closeSitePreviewPane={ closeSitePreviewPane } />
			<SectionNav className="preview-pane__navigation" selectedText={ selectedFeature.tab.label }>
				{ navItems && navItems.length > 0 && canDisplayNavTabs ? (
					<NavTabs>{ navItems }</NavTabs>
				) : null }
			</SectionNav>
			{ selectedFeature.preview }
		</div>
	);
}
