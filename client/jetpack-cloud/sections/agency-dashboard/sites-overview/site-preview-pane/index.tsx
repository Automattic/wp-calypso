import classNames from 'classnames';
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
	const [ canDisplayNavTabs, setCanDisplayNavTabs ] = useState( false );

	// For future iterations lets consider something other than SectionNav due to the
	// manipulation we need to make so that the navigation shows correctly on some smaller
	// screens within the PreviewPane (hence the timeout).
	useEffect( () => {
		setTimeout( () => {
			setCanDisplayNavTabs( true );
		}, 150 );
	}, [] );

	const currentURL = window.location.href;

	useEffect( () => {
		const handleClick = ( event: MouseEvent ) => {
			const target = event.target as HTMLElement;
			if ( ! target ) {
				return;
			}

			if ( currentURL.includes( 'jetpack-scan' ) ) {
				const newScanURL = currentURL.split( 'jetpack-scan' )[ 0 ] + 'jetpack-scan';

				const scanLinks = [
					...document.querySelectorAll(
						'a.section-nav-tab__link[href*="/scan/"]:not([href*="/scan/history"])'
					),
					...document.querySelectorAll( 'a.section-nav-tab__link[href*="/scan/history"]' ),
					...document.querySelectorAll( 'a.section-nav-tab__link[href*="/scan/history/fixed"]' ),
					...document.querySelectorAll( 'a.section-nav-tab__link[href*="/scan/history/ignored"]' ),
				];

				scanLinks.forEach( ( link ) => {
					let newerScanURL = newScanURL;
					if ( ( link as HTMLAnchorElement ).href.includes( '/scan/history' ) ) {
						newerScanURL += '/history';
					} else if ( ( link as HTMLAnchorElement ).href.includes( '/scan/history/fixed' ) ) {
						newerScanURL += '/history/fixed';
					} else if ( ( link as HTMLAnchorElement ).href.includes( '/scan/history/ignored' ) ) {
						newerScanURL += '/history/ignored';
					}

					( link as HTMLAnchorElement ).setAttribute( 'href', newerScanURL );
				} );
			}
		};

		document.addEventListener( 'click', handleClick );

		return () => {
			document.removeEventListener( 'click', handleClick );
		};
	}, [ currentURL ] );

	// Ensure we have features
	if ( ! features || ! features.length ) {
		return null;
	}

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
			<NavItem selected={ featureTab.selected } onClick={ featureTab.onClick }>
				{ featureTab.label }
			</NavItem>
		);
	} );

	return (
		<div className={ classNames( 'site-preview__pane', className ) }>
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
