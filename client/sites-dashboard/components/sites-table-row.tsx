import { ListTile, Popover } from '@automattic/components';
import { useSiteLaunchStatusLabel } from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { memo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import TimeSince from 'calypso/components/time-since';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { hasSiteStatsQueryFailed } from 'calypso/state/stats/lists/selectors';
import {
	displaySiteUrl,
	getDashboardUrl,
	isNotAtomicJetpack,
	isStagingSite,
	MEDIA_QUERIES,
	siteDefaultInterface,
	getSiteWpAdminUrl,
} from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesP2Badge from './sites-p2-badge';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteLaunchNag } from './sites-site-launch-nag';
import { SiteName } from './sites-site-name';
import { SitePlan } from './sites-site-plan';
import { SiteUrl, Truncated } from './sites-site-url';
import SitesStagingBadge from './sites-staging-badge';
import TransferNoticeWrapper from './sites-transfer-notice-wrapper';
import { ThumbnailLink } from './thumbnail-link';
import { WithAtomicTransfer } from './with-atomic-transfer';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteTableRowProps {
	site: SiteExcerptData;
}

const Row = styled.tr`
	line-height: 2em;
	border-block-end: 1px solid #eee;
`;

const Column = styled.td< { mobileHidden?: boolean } >`
	padding-block-start: 12px;
	padding-block-end: 12px;
	padding-inline-end: 24px;
	vertical-align: middle;
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-60 );
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	${ MEDIA_QUERIES.mediumOrSmaller } {
		${ ( props ) => props.mobileHidden && 'display: none;' };
		padding-inline-end: 0;
	}

	.stats-sparkline__bar {
		fill: var( --studio-gray-60 );
	}
`;

const SiteListTile = styled( ListTile )`
	margin-inline-end: 0;

	${ MEDIA_QUERIES.mediumOrSmaller } {
		margin-inline-end: 12px;
	}
`;

const ListTileLeading = styled( ThumbnailLink )`
	${ MEDIA_QUERIES.mediumOrSmaller } {
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
`;

const StatsOffIndicatorStyled = styled.div`
	text-align: center;
	border: 1px solid var( --studio-gray-5 );
	border-radius: 4px;
	background-color: var( --studio-gray-5 );
	color: var( --studio-gray-100 );
	font-size: 12px;
	padding: 0 7px;
	display: inline-flex;
`;

const PopoverContent = styled.div`
	font-size: 14px;
	padding: 16px;
	color: var( --color-neutral-50 );
`;

const StatsColumnStyled = styled( Column )`
	text-align: center;
`;

const StatsOffIndicator = () => {
	const [ showPopover, setShowPopover ] = useState( false );
	const tooltipRef = useRef( null );
	const translate = useTranslate();

	const handleOnMouseEnter = () => {
		setShowPopover( true );
	};

	const handleOnMouseExit = () => {
		setShowPopover( false );
	};

	return (
		<div
			onMouseOver={ handleOnMouseEnter }
			onMouseOut={ handleOnMouseExit }
			onFocus={ handleOnMouseEnter }
			onBlur={ handleOnMouseExit }
		>
			<StatsOffIndicatorStyled className="tooltip-target" ref={ tooltipRef }>
				{ translate( 'Stats off' ) }
			</StatsOffIndicatorStyled>
			<Popover isVisible={ showPopover } context={ tooltipRef.current } css={ { marginTop: -5 } }>
				<PopoverContent>{ translate( 'Stats are disabled on this site.' ) }</PopoverContent>
			</Popover>
		</div>
	);
};

export default memo( function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();
	const translatedStatus = useSiteLaunchStatusLabel( site );
	const { ref, inView } = useInView( { triggerOnce: true } );
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );
	const hasHostingFeatures = ! isNotAtomicJetpack( site ) && ! isP2Site;

	const hasStatsLoadingError = useSelector( ( state ) => {
		const siteId = site.ID;
		const query = {};
		const statType = 'statsInsights';
		return siteId && hasSiteStatsQueryFailed( state, siteId, statType, query );
	} );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	return (
		<Row ref={ ref }>
			<Column>
				<SiteListTile
					contentClassName={ css`
						min-width: 0;
					` }
					leading={
						<ListTileLeading
							href={
								hasHostingFeatures && siteDefaultInterface( site ) === 'wp-admin'
									? getSiteWpAdminUrl( site ) || getDashboardUrl( site.slug )
									: getDashboardUrl( site.slug )
							}
							title={ __( 'Visit Dashboard' ) }
						>
							<SiteItemThumbnail displayMode="list" showPlaceholder={ ! inView } site={ site } />
						</ListTileLeading>
					}
					title={
						<ListTileTitle>
							<SiteName
								href={
									hasHostingFeatures && siteDefaultInterface( site ) === 'wp-admin'
										? getSiteWpAdminUrl( site ) || getDashboardUrl( site.slug )
										: getDashboardUrl( site.slug )
								}
								title={ __( 'Visit Dashboard' ) }
							>
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
						<ListTileSubtitle>
							<SiteUrl href={ siteUrl } title={ siteUrl }>
								<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
							</SiteUrl>
						</ListTileSubtitle>
					}
				/>
			</Column>
			<Column mobileHidden>
				<SitePlan site={ site } userId={ userId } />
			</Column>
			<Column mobileHidden>
				<WithAtomicTransfer site={ site }>
					{ ( result ) =>
						result.wasTransferring ? (
							<TransferNoticeWrapper { ...result } />
						) : (
							<>
								{ translatedStatus }
								<SiteLaunchNag site={ site } />
							</>
						)
					}
				</WithAtomicTransfer>
			</Column>
			<Column mobileHidden>
				{ site.options?.updated_at ? <TimeSince date={ site.options.updated_at } /> : '' }
			</Column>
			<StatsColumnStyled mobileHidden>
				{ inView && (
					<>
						{ hasStatsLoadingError ? (
							<StatsOffIndicator />
						) : (
							<a href={ `/stats/day/${ site.slug }` }>
								<StatsSparkline siteId={ site.ID } showLoader={ true } />
							</a>
						) }
					</>
				) }
			</StatsColumnStyled>
			<Column style={ { width: '24px' } }>{ inView && <SitesEllipsisMenu site={ site } /> }</Column>
		</Row>
	);
} );
