import {
	siteByIdQuery,
	siteLatestAtomicTransferQuery,
	isDeletingStagingSiteQuery,
	queryClient,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React, { useState } from 'react';
import { GuidedTourStep } from 'calypso/components/guided-tour/step';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import {
	isAtomicTransferInProgress,
	isAtomicTransferredSite,
} from 'calypso/dashboard/utils/site-atomic-transfers';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { StagingSiteCreationBanner } from 'calypso/sites/staging-site/components/staging-site-transfer-banner/staging-site-creation-banner';
import { StagingSiteDeletionBanner } from 'calypso/sites/staging-site/components/staging-site-transfer-banner/staging-site-deletion-banner';
import ItemViewContent from './item-view-content';
import ItemViewHeader from './item-view-header';
import ItemViewBreadcrumbsHeader from './item-view-header/breadcrumbs';
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
	hideHeader,
	breadcrumbs,
	shouldShowBreadcrumbs,
}: ItemViewProps ) {
	const [ navRef, setNavRef ] = useState< HTMLElement | null >( null );

	// The is_wpcom_staging_site flag isn't site while the site is being transferred
	// so it can't be used here to determine if the site is a staging site
	const isStagingSite = itemData.subtitle?.toString().startsWith( 'staging-' );

	const { data: isStagingSiteDeletionInProgress } = useQuery(
		{
			...isDeletingStagingSiteQuery( itemData.blogId ?? 0 ),
			enabled: !! itemData.blogId && isStagingSite,
		},
		queryClient
	);

	const { data: atomicTransfer } = useQuery( {
		...siteLatestAtomicTransferQuery( itemData.blogId ?? 0 ),
		refetchInterval: ( query ) => {
			return isAtomicTransferInProgress( query.state.data?.status ?? 'pending' ) ? 5000 : false;
		},
		enabled: !! itemData.blogId && isStagingSite,
	} );

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( itemData.blogId ?? 0 ),
		refetchInterval: ( query ) => {
			if ( ! isStagingSite ) {
				return false;
			}

			if ( ! query.state.data ) {
				return 0;
			}

			return query.state.data.jetpack_connection && isAtomicTransferredSite( query.state.data )
				? false
				: 5000;
		},
		enabled: !! itemData.blogId && isStagingSite,
	} );

	const isStagingSiteTransferInProgress =
		isStagingSite &&
		stagingSite &&
		isAtomicTransferInProgress( atomicTransfer?.status ?? 'pending' ) &&
		! stagingSite?.jetpack_connection &&
		! isAtomicTransferredSite( stagingSite );

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

	const shouldHideHeader = hideHeader || shouldShowBreadcrumbs;
	const shouldHideNav =
		( hideNavIfSingleTab && featureTabs.length <= 1 ) || isMobileApp || shouldShowBreadcrumbs;

	const renderHeader = () => {
		if ( shouldHideHeader ) {
			return null;
		}

		return (
			<ItemViewHeader
				closeItemView={ closeItemView }
				itemData={ itemData }
				isPreviewLoaded={ !! selectedFeature.preview }
				extraProps={ itemViewHeaderExtraProps }
			/>
		);
	};

	if ( isStagingSiteTransferInProgress || isStagingSiteDeletionInProgress ) {
		return (
			<div className={ clsx( 'hosting-dashboard-item-view', className ) }>
				{ renderHeader() }
				{ isStagingSiteDeletionInProgress ? (
					<StagingSiteDeletionBanner siteId={ itemData.blogId ?? 0 } />
				) : (
					<StagingSiteCreationBanner />
				) }
			</div>
		);
	}

	return (
		<div className={ clsx( 'hosting-dashboard-item-view', className ) }>
			{ renderHeader() }
			{ shouldShowBreadcrumbs && <ItemViewBreadcrumbsHeader breadcrumbs={ breadcrumbs } /> }
			<div ref={ setNavRef }>
				<SectionNav
					className={ clsx( 'hosting-dashboard-item-view__navigation', {
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
			<ItemViewContent siteId={ itemData.blogId } featureId={ selectedFeature.id }>
				{ selectedFeature.preview }
			</ItemViewContent>
		</div>
	);
}
