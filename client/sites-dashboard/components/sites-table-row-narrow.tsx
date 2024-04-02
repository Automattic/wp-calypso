import { ListTile } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo } from 'react';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import { useDispatch, useSelector } from 'calypso/state';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	displaySiteUrl,
	getDashboardUrl,
	isStagingSite,
	MEDIA_QUERIES,
	siteDefaultInterface,
	getSiteWpAdminUrl,
} from '../utils';
import SitesP2Badge from './sites-p2-badge';
import { SiteAdminLink } from './sites-site-admin-link';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';
import SitesStagingBadge from './sites-staging-badge';
import { ThumbnailLink } from './thumbnail-link';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteTableRowProps {
	site: SiteExcerptData;
}

const Row = styled.tr`
	line-height: 2em;
	border-block-end: 1px solid #eee;
`;

const RowSelected = styled( Row )`
	border-left: 4px solid var( --studio-blue-50 );
`;

const Column = styled.td< { tabletHidden?: boolean } >`
	padding-block-start: 12px;
	padding-block-end: 12px;
	padding-inline-end: 12px;
	vertical-align: middle;
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-60 );
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	${ MEDIA_QUERIES.hideTableRows } {
		${ ( props ) => props.tabletHidden && 'display: none;' };
		padding-inline-end: 0;
	}

	.stats-sparkline__bar {
		fill: var( --studio-gray-60 );
	}
`;

const SiteListTile = styled( ListTile )`
	margin-inline-end: 0;

	${ MEDIA_QUERIES.hideTableRows } {
		margin-inline-end: 12px;
	}
`;

const ListTileLeading = styled( ThumbnailLink )`
	${ MEDIA_QUERIES.hideTableRows } {
		margin-inline-end: 12px;
	}
`;

const ListTileTitle = styled.div`
	display: flex;
	align-items: center;
	margin-block-end: 8px;
`;

const ListTileSubtitle = styled.div`
	display: flex;
	align-items: center;

	&:not( :last-child ) {
		margin-block-end: 2px;
	}
`;

function SitesTableNarrowRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();
	const { ref, inView } = useInView( { triggerOnce: true } );

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const computeDashboardUrl = ( site: SiteExcerptData ) => {
		if ( siteDefaultInterface( site ) === 'wp-admin' ) {
			return getSiteWpAdminUrl( site ) || getDashboardUrl( site.slug );
		}
		return getDashboardUrl( site.slug );
	};
	const dashboardUrl = computeDashboardUrl( site );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const dispatch = useDispatch();
	const onSiteClick = ( event: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => {
		event.stopPropagation();
		event.preventDefault();
		dispatch( setSelectedSiteId( site.ID ) );
	};

	const title = __( 'View Site Details' );
	const isSiteSelected = useSelector( ( state ) => getSelectedSiteId( state ) === site.ID );
	const RowStyledComponent = isSiteSelected ? RowSelected : Row;
	return (
		<RowStyledComponent ref={ ref }>
			<Column>
				<SiteListTile
					contentClassName={ css`
						min-width: 0;
					` }
					leading={
						<ListTileLeading href={ dashboardUrl } title={ title } onClick={ onSiteClick }>
							<SiteItemThumbnail
								displayMode="list"
								showPlaceholder={ ! inView }
								site={ site }
								isSmall={ true }
							/>
						</ListTileLeading>
					}
					title={
						<ListTileTitle>
							<SiteName href={ dashboardUrl } title={ title } onClick={ onSiteClick }>
								{ site.title }
							</SiteName>
							{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
							{ isWpcomStagingSite && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }
							{ isTrialSitePlan && (
								<SitesMigrationTrialBadge>{ __( 'Trial' ) }</SitesMigrationTrialBadge>
							) }
						</ListTileTitle>
					}
					subtitle={
						<>
							<ListTileSubtitle>
								<SiteUrl href={ siteUrl } title={ siteUrl }>
									<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
								</SiteUrl>
							</ListTileSubtitle>
							<ListTileSubtitle>
								<SiteAdminLink href={ getSiteWpAdminUrl( site ) } title={ __( 'Visit WP Admin' ) }>
									{ __( 'WP Admin' ) }
								</SiteAdminLink>
							</ListTileSubtitle>
						</>
					}
				/>
			</Column>
		</RowStyledComponent>
	);
}
export default memo( SitesTableNarrowRow );
