import { Button, ListTile, Popover } from '@automattic/components';
import {
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
	useSiteLaunchStatusLabel,
} from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import { memo, useRef, useState } from 'react';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { useDispatch as useReduxDispatch } from 'react-redux';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import TimeSince from 'calypso/components/time-since';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import useRestoreSiteMutation from 'calypso/sites-dashboard/hooks/use-restore-site-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import { hasSiteStatsQueryFailed } from 'calypso/state/stats/lists/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import {
	displaySiteUrl,
	getDashboardUrl,
	isStagingSite,
	MEDIA_QUERIES,
	siteDefaultInterface,
	getSiteWpAdminUrl,
} from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesP2Badge from './sites-p2-badge';
import { SiteAdminLink } from './sites-site-admin-link';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteLaunchNag } from './sites-site-launch-nag';
import { SiteName } from './sites-site-name';
import { SitePlan } from './sites-site-plan';
import { SiteUrl, Truncated } from './sites-site-url';
import SitesStagingBadge from './sites-staging-badge';
import TransferNoticeWrapper from './sites-transfer-notice-wrapper';
import { ThumbnailLink } from './thumbnail-link';
import { WithAtomicTransfer } from './with-atomic-transfer';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteTableRowProps {
	site: SiteExcerptData;
}

const Row = styled.tr`
	line-height: 2em;
	border-block-end: 1px solid #eee;
`;

const Column = styled.td< { tabletHidden?: boolean; deletedSite?: boolean } >`
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

	${ MEDIA_QUERIES.small } {
		${ ( props ) => props.deletedSite && 'width: 80%;' };
	}

	${ MEDIA_QUERIES.mediumOrSmaller } {
		&:first-child {
			padding-inline-start: 12px;
		}
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

const BadgeDIFM = styled.span`
	color: var( --studio-gray-100 );
	white-space: break-spaces;
`;

const DeletedStatus = styled.div`
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	padding-left: 8px;
	span {
		color: var( --color-error );
	}
	button {
		padding: 4px;
	}

	${ MEDIA_QUERIES.small } {
		span {
			display: none;
		}
	}
`;

const RestoreButton = styled( Button )`
	color: var( --color-link ) !important;
	font-size: 12px;
	text-decoration: underline;
`;

const StatsOffContainer = styled.div`
	text-align: left;
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
		<StatsOffContainer
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
		</StatsOffContainer>
	);
};

export default memo( function SitesTableRow( { site }: SiteTableRowProps ) {
	const isDIFMInProgress = useSelector( ( state ) => isDIFMLiteInProgress( state, site.ID ) );

	const { __ } = useI18n();
	const translatedStatus = useSiteLaunchStatusLabel( site );
	const { ref, inView } = useInView( { triggerOnce: true } );
	const userId = useSelector( getCurrentUserId );
	const reduxDispatch = useReduxDispatch();
	const queryClient = useQueryClient();

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const hasStatsLoadingError = useSelector( ( state ) => {
		const siteId = site.ID;
		const query = {};
		const statType = 'statsInsights';
		return siteId && hasSiteStatsQueryFailed( state, siteId, statType, query );
	} );

	const { mutate: restoreSite, isPending: isRestoring } = useRestoreSiteMutation( {
		onSuccess() {
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'all',
				],
			} );
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'deleted',
				],
			} );
			reduxDispatch(
				successNotice( __( 'The site has been restored.' ), {
					duration: 3000,
				} )
			);
		},
		onError: ( error ) => {
			if ( error.status === 403 ) {
				reduxDispatch(
					errorNotice( __( 'Only an administrator can restore a deleted site.' ), {
						duration: 5000,
					} )
				);
			} else {
				reduxDispatch(
					errorNotice( __( 'We were unable to restore the site.' ), { duration: 5000 } )
				);
			}
		},
	} );

	const computeDashboardUrl = ( site: SiteExcerptData ) => {
		if ( siteDefaultInterface( site ) === 'wp-admin' ) {
			return getSiteWpAdminUrl( site ) || getDashboardUrl( site.slug );
		}
		return getDashboardUrl( site.slug );
	};

	const handleRestoreSite = () => {
		restoreSite( site.ID );
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

	return (
		<Row ref={ ref }>
			<Column deletedSite={ site.is_deleted }>
				<SiteListTile
					contentClassName={ css`
						min-width: 0;
					` }
					leading={
						<ListTileLeading href={ dashboardUrl } title={ title } onClick={ onSiteClick }>
							<SiteItemThumbnail displayMode="list" showPlaceholder={ ! inView } site={ site } />
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
									<SiteAdminLink
										href={ getSiteWpAdminUrl( site ) }
										title={ __( 'Visit WP Admin' ) }
									>
										{ __( 'WP Admin' ) }
									</SiteAdminLink>
								</ListTileSubtitle>
							</>
						)
					}
				/>
			</Column>
			<Column tabletHidden>
				<SitePlan site={ site } userId={ userId } />
			</Column>
			<Column tabletHidden={ ! site.is_deleted }>
				{ site.is_deleted ? (
					<DeletedStatus>
						<span>{ __( 'Deleted' ) }</span>
						{ isRestoring ? (
							<Spinner />
						) : (
							<RestoreButton borderless onClick={ handleRestoreSite }>
								{ __( 'Restore' ) }
							</RestoreButton>
						) }
					</DeletedStatus>
				) : (
					<WithAtomicTransfer site={ site }>
						{ ( result ) =>
							result.wasTransferring ? (
								<TransferNoticeWrapper { ...result } />
							) : (
								<>
									<div>
										{ translatedStatus }
										<SiteLaunchNag site={ site } />
									</div>
									{ isDIFMInProgress && (
										<BadgeDIFM className="site__badge">{ __( 'Express Service' ) }</BadgeDIFM>
									) }
								</>
							)
						}
					</WithAtomicTransfer>
				) }
			</Column>
			<Column tabletHidden>
				{ site.options?.updated_at ? <TimeSince date={ site.options.updated_at } /> : '' }
			</Column>
			<StatsColumnStyled tabletHidden>
				{ inView && (
					<>
						{ hasStatsLoadingError || site.is_deleted ? (
							<StatsOffIndicator />
						) : (
							<a href={ `/stats/day/${ site.slug }` }>
								<StatsSparkline siteId={ site.ID } showLoader />
							</a>
						) }
					</>
				) }
			</StatsColumnStyled>
			<Column style={ site.is_deleted ? { display: 'none' } : { width: '36px' } }>
				{ inView && <SitesEllipsisMenu site={ site } /> }
			</Column>
		</Row>
	);
} );
