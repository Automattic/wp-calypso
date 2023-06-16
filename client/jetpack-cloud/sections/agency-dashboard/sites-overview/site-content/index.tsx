import { Card } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useContext, forwardRef, createRef, useMemo } from 'react';
import Pagination from 'calypso/components/pagination';
import LicenseLightbox from 'calypso/jetpack-cloud/sections/partner-portal/license-lightbox';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/url';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import EditButton from '../../dashboard-bulk-actions/edit-button';
import {
	useDashboardShowLargeScreen,
	useJetpackAgencyDashboardRecordTrackEvent,
} from '../../hooks';
import SitesOverviewContext from '../context';
import SiteBulkSelect from '../site-bulk-select';
import SiteCard from '../site-card';
import SiteSort from '../site-sort';
import SiteTable from '../site-table';
import { formatSites, getProductSlugFromProductType, siteColumns } from '../utils';

import './style.scss';

const addPageArgs = ( pageNumber: number ) => {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;
	page( addQueryArgs( queryParams, currentPath ) );
};

interface Props {
	data: { sites: Array< any >; total: number; perPage: number; totalFavorites: number } | undefined;
	isLoading: boolean;
	currentPage: number;
	isFavoritesTab: boolean;
}

const SiteContent = ( { data, isLoading, currentPage, isFavoritesTab }: Props, ref: any ) => {
	const isMobile = useMobileBreakpoint();

	const translate = useTranslate();

	const { isBulkManagementActive, currentLicenseInfo, hideLicenseInfo } =
		useContext( SitesOverviewContext );

	const recordEvent = useJetpackAgencyDashboardRecordTrackEvent( null, ! isMobile );

	const sites = formatSites( data?.sites );

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
	};

	const siteTableRef = createRef< HTMLTableElement >();

	const isLargeScreen = useDashboardShowLargeScreen( siteTableRef, ref );

	const firstColumn = siteColumns[ 0 ];

	const { data: products } = useProductsQuery();

	const currentLicenseProductSlug = currentLicenseInfo
		? getProductSlugFromProductType( currentLicenseInfo )
		: null;

	const currentLicenseProduct = useMemo( () => {
		return currentLicenseProductSlug && products
			? products.find( ( product ) => product.slug === currentLicenseProductSlug )
			: null;
	}, [ currentLicenseProductSlug, products ] );

	const onIssueLicense = () => {
		if ( currentLicenseProductSlug ) {
			recordEvent( 'calypso_jetpack_agency_dashboard_issue_license_info', {
				products: currentLicenseProductSlug,
			} );
			hideLicenseInfo();
			page(
				addQueryArgs(
					{
						product_slug: currentLicenseProductSlug,
						source: 'dashboard',
					},
					'/partner-portal/issue-license/'
				)
			);
		}
	};

	const onHideLicenseInfo = () => {
		recordEvent( 'calypso_jetpack_agency_dashboard_hide_license_info' );
		hideLicenseInfo();
	};

	return (
		<>
			{ isLargeScreen ? (
				<div className="site-content__large-screen-view">
					<SiteTable
						ref={ siteTableRef }
						isLoading={ isLoading }
						columns={ siteColumns }
						items={ sites }
					/>
				</div>
			) : (
				<div className="site-content__small-screen-view">
					<Card className="site-content__bulk-select">
						{ isBulkManagementActive ? (
							<SiteBulkSelect sites={ sites } isLoading={ isLoading } />
						) : (
							<>
								<SiteSort isSortable={ firstColumn.isSortable } columnKey={ firstColumn.key }>
									<span className="site-content__bulk-select-label">{ firstColumn.title }</span>
								</SiteSort>
								<EditButton sites={ sites } isLoading={ isLoading } />
							</>
						) }
					</Card>
					<div className="site-content__mobile-view">
						<>
							{ isLoading ? (
								<Card>
									<TextPlaceholder />
								</Card>
							) : (
								<>
									{ sites.length > 0 &&
										sites.map( ( rows, index ) => (
											<SiteCard key={ index } columns={ siteColumns } rows={ rows } />
										) ) }
								</>
							) }
						</>
					</div>
				</div>
			) }

			{ data && data?.total > 0 && (
				<Pagination
					compact={ isMobile }
					page={ currentPage }
					perPage={ data.perPage }
					total={ isFavoritesTab ? data.totalFavorites : data.total }
					pageClick={ handlePageClick }
				/>
			) }

			{ currentLicenseProduct && (
				<LicenseLightbox
					product={ currentLicenseProduct }
					ctaLabel={ translate( 'Issue License' ) }
					onActivate={ onIssueLicense }
					onClose={ onHideLicenseInfo }
				/>
			) }
		</>
	);
};

export default forwardRef( SiteContent );
