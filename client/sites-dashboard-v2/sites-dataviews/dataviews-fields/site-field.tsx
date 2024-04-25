import { ListTile, Button } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
//import { useInView } from 'react-intersection-observer';
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
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: ( site: SiteExcerptData ) => void;
};

const SiteListTile = styled( ListTile )`
	margin-inline-end: 0;
	max-width: 340px;

	.preview-hidden & {
		max-width: 500px;
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
	margin-block-end: 8px;
`;

const ListTileSubtitle = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	text-overflow: ellipsis;
	overflow: hidden;
	font-size: 14px;
	color: var( --studio-gray-60 ) !important;
	svg {
		flex-shrink: 0;
	}

	&:not( :last-child ) {
		margin-block-end: 2px;
	}
`;

const SiteField = ( { site, openSitePreviewPane }: Props ) => {
	const { __ } = useI18n();
	// todo: This hook is used by the SiteItemThumbnail component below, in a prop showPlaceholder={ ! inView }. It does not work as expected. Fix it.
	//const { inView } = useInView( { triggerOnce: true } );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const title = __( 'View Site Details' );

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const onSiteClick = ( event: React.MouseEvent ) => {
		openSitePreviewPane && openSitePreviewPane( site );
		event.preventDefault();
	};

	return (
		<Button onClick={ onSiteClick } borderless={ true }>
			<SiteListTile
				contentClassName={ css`
					min-width: 0;
				` }
				leading={
					<ListTileLeading title={ title }>
						<SiteItemThumbnail displayMode="list" showPlaceholder={ false } site={ site } />
					</ListTileLeading>
				}
				title={
					<ListTileTitle>
						<SiteName title={ title }>
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
							<ListTileSubtitle>
								<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
							</ListTileSubtitle>
						</>
					)
				}
			/>
		</Button>
	);
};

export default SiteField;
