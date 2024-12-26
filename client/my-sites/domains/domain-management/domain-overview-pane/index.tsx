import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { useMergeRefs } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef } from 'react';
import ItemView from 'calypso/layout/multi-sites-dashboard/item-view';
import * as paths from 'calypso/my-sites/domains/paths';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { FEATURE_TO_ROUTE_MAP, DOMAIN_OVERVIEW, EMAIL_MANAGEMENT } from './constants';
import type {
	ItemData,
	FeaturePreviewInterface,
} from 'calypso/layout/multi-sites-dashboard/item-view/types';

import './style.scss';

interface Props {
	selectedDomainPreview: React.ReactNode;
	selectedDomain: string;
	selectedFeature: string;
	siteSlug: string;
	site: SiteExcerptData;
}

export function showDomainManagementPage( route: string ) {
	const currentParams = new URL( window.location.href ).searchParams;
	const newUrl = new URL( route, window.location.origin );

	const supportedParams = [ 'page', 'per-page', 'search', 'status' ];
	supportedParams.forEach( ( param ) => {
		if ( currentParams.has( param ) ) {
			const value = currentParams.get( param );
			if ( value ) {
				newUrl.searchParams.set( param, value );
			}
		}
	} );

	page.show( newUrl.toString().replace( window.location.origin, '' ) );
}

type BtnProps = {
	focusRef: React.RefObject< HTMLButtonElement >;
	itemData: ItemData;
	closeSitePreviewPane?: () => void;
};

// This is the tabbed preview pane that is used for the domain management pages.
// Anything passed as selectedDomainPreview will be rendered in the preview pane.
// The selectedFeature prop is used to determine which tab is selected by default.
const DomainOverviewPane = ( {
	selectedDomainPreview,
	selectedDomain,
	selectedFeature,
	siteSlug,
	site,
}: Props ) => {
	const itemData: ItemData = {
		title: selectedDomain,
		subtitle: site.name || selectedDomain,
		url: site.URL,
		blogId: site.ID,
		isDotcomSite: site.is_wpcom_atomic || site.is_wpcom_staging_site,
		adminUrl: site.options?.admin_url || `${ site.URL }/wp-admin`,
		withIcon: false,
		hideEnvDataInHeader: true,
	};
	const translate = useTranslate();
	const { adminUrl } = useSiteAdminInterfaceData( itemData.blogId );

	const PreviewPaneHeaderButtons = ( { focusRef, closeSitePreviewPane }: BtnProps ) => {
		const adminButtonRef = useRef< HTMLButtonElement | null >( null );
		const mergedRef = useMergeRefs( [ adminButtonRef, focusRef ] );
		return (
			<>
				<Button onClick={ closeSitePreviewPane } className="button item-view__close-button">
					{ __( 'Close' ) }
				</Button>
				{ ! site.options?.is_domain_only && (
					<Button
						primary
						className="button item-preview__admin-button"
						href={ adminUrl }
						ref={ mergedRef }
					>
						{ translate( 'Manage site' ) }
					</Button>
				) }
			</>
		);
	};

	const features: FeaturePreviewInterface[] = useMemo( () => {
		const siteFeatures = [
			{
				label: __( 'Overview' ),
				enabled: true,
				featureIds: [ DOMAIN_OVERVIEW ],
			},
			{
				label: __( 'Email' ),
				enabled: true,
				featureIds: [ EMAIL_MANAGEMENT ],
			},
		];

		return siteFeatures.map( ( { label, enabled, featureIds } ) => {
			const selected = enabled && featureIds.includes( selectedFeature );
			const defaultFeatureId = featureIds[ 0 ];
			return {
				id: defaultFeatureId,
				tab: {
					label,
					visible: enabled,
					selected,
					onTabClick: () => {
						if ( enabled && ! selected ) {
							showDomainManagementPage(
								FEATURE_TO_ROUTE_MAP[ defaultFeatureId ]
									.replace( ':domain', selectedDomain )
									.replace( ':site', siteSlug )
							);
						}
					},
				},
				enabled,
				preview: enabled ? selectedDomainPreview : null,
			};
		} );
	}, [ __, selectedDomain, selectedFeature, selectedDomainPreview ] );

	return (
		<ItemView
			itemData={ itemData }
			closeItemView={ () => {
				page.show( paths.domainManagementRoot() );
			} }
			features={ features }
			enforceTabsView
			itemViewHeaderExtraProps={ {
				headerButtons: PreviewPaneHeaderButtons,
			} }
		/>
	);
};

export default DomainOverviewPane;
