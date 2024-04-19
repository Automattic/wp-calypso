import { isEnabled } from '@automattic/calypso-config';
import { ListTile } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesP2Badge from 'calypso/sites-dashboard/components/sites-p2-badge';
import { SiteAdminLink } from 'calypso/sites-dashboard/components/sites-site-admin-link';
import { SiteItemThumbnail } from 'calypso/sites-dashboard/components/sites-site-item-thumbnail';
import { SiteName } from 'calypso/sites-dashboard/components/sites-site-name';
import { SiteUrl, Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import { ThumbnailLink } from 'calypso/sites-dashboard/components/thumbnail-link';
import {
	displaySiteUrl,
	// getDashboardUrl,
	getSiteWpAdminUrl,
	isStagingSite,
	MEDIA_QUERIES,
	// siteDefaultInterface,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: ( site: SiteExcerptData ) => void;
};

const SiteField = ( { site, openSitePreviewPane }: Props ) => {
	const { __ } = useI18n();
	const { inView } = useInView( { triggerOnce: true } );

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

	/*
	const computeDashboardUrl = ( site: SiteExcerptData ) => {
		if ( siteDefaultInterface( site ) === 'wp-admin' ) {
			return getSiteWpAdminUrl( site ) || getDashboardUrl( site.slug );
		}
		return getDashboardUrl( site.slug );
	};

	const dashboardUrl = computeDashboardUrl( site );
	*/
	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	let title = __( 'Visit Dashboard' );
	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		title = __( 'View Site Details' );
	}

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const onSiteClick = ( event: React.MouseEvent ) => {
		event.preventDefault();
		openSitePreviewPane && openSitePreviewPane( site );
	};

	return (
		<SiteListTile
			contentClassName={ css`
				min-width: 0;
			` }
			leading={
				<ListTileLeading title={ title } onClick={ onSiteClick }>
					<SiteItemThumbnail displayMode="list" showPlaceholder={ ! inView } site={ site } />
				</ListTileLeading>
			}
			title={
				<ListTileTitle>
					<SiteName title={ title } onClick={ onSiteClick }>
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
				site.is_deleted ? (
					<>
						<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
					</>
				) : (
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
				)
			}
		/>
	);
};

export default SiteField;
