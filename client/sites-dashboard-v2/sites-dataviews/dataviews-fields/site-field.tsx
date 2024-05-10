import { ListTile, Button } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import * as React from 'react';
//import { useInView } from 'react-intersection-observer';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesP2Badge from 'calypso/sites-dashboard/components/sites-p2-badge';
import { SiteItemThumbnail } from 'calypso/sites-dashboard/components/sites-site-item-thumbnail';
import { SiteName } from 'calypso/sites-dashboard/components/sites-site-name';
import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import { ThumbnailLink } from 'calypso/sites-dashboard/components/thumbnail-link';
import { displaySiteUrl, isStagingSite, MEDIA_QUERIES } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { getSiteHomeUrl, getSiteOption } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: ( site: SiteExcerptData ) => void;
};

const SiteListTile = styled( ListTile )`
	gap: 0;
	margin-inline-end: 0;
	width: 295px;

	.preview-hidden & {
		gap: 12px;
		max-width: 500px;
		width: 100%;
	}

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
`;

const SiteField = ( { site, openSitePreviewPane }: Props ) => {
	const { __ } = useI18n();

	// Todo: This hook is used by the SiteItemThumbnail component below, in a prop showPlaceholder={ ! inView }.
	// It does not work as expected. Fix it.
	// const { inView } = useInView( { triggerOnce: true } );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const title = __( 'View Site Details' );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, site.ID ) ?? '' );
	const siteHomeUrl = useSelector( ( state ) => getSiteHomeUrl( state, site.ID ) ?? '' );
	const isAdminInterfaceWPAdmin = useSelector(
		( state ) => getSiteOption( state, site.ID, 'wpcom_admin_interface' ) === 'wp-admin'
	);

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const onSiteClick = ( event: React.MouseEvent ) => {
		openSitePreviewPane && openSitePreviewPane( site );
		event.preventDefault();
	};

	return (
		<div className="sites-dataviews__site">
			<SiteListTile
				contentClassName={ classnames(
					'sites-dataviews__site-name',
					css`
						min-width: 0;
						text-align: start;
					`
				) }
				leading={
					<Button className="sites-dataviews__preview-trigger" onClick={ onSiteClick } borderless>
						<ListTileLeading title={ title }>
							<SiteItemThumbnail
								className="sites-site-thumbnail"
								displayMode="list"
								showPlaceholder={ false }
								site={ site }
							/>
							<SiteFavicon
								className="sites-site-favicon"
								blogId={ site.ID }
								isDotcomSite={ site.is_wpcom_atomic }
							/>
						</ListTileLeading>
					</Button>
				}
				title={
					<ListTileTitle>
						<SiteName as="div" title={ title }>
							<Truncated>{ site.title }</Truncated>
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
							<div className="sites-dataviews__site-url">
								<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
							</div>
							<a
								className="sites-dataviews__site-wp-admin-url"
								href={ isAdminInterfaceWPAdmin ? siteAdminUrl : siteHomeUrl }
							>
								<Truncated>
									{ isAdminInterfaceWPAdmin ? __( 'WP Admin' ) : __( 'My Home' ) }
								</Truncated>
							</a>
						</>
					)
				}
			/>
		</div>
	);
};

export default SiteField;
