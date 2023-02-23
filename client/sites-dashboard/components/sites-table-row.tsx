import { ListTile } from '@automattic/components';
import { useSiteLaunchStatusLabel } from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import StatsSparkline from 'calypso/blocks/stats-sparkline';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { useInView } from 'calypso/lib/use-in-view';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { displaySiteUrl, getDashboardUrl, isNotAtomicJetpack, MEDIA_QUERIES } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesP2Badge from './sites-p2-badge';
import { PlanRenewNag } from './sites-plan-renew-nag';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteLaunchNag } from './sites-site-launch-nag';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';
import { ThumbnailLink } from './thumbnail-link';
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

const SitePlan = styled.div`
	display: inline;
	> * {
		vertical-align: middle;
		line-height: normal;
	}
`;

const SitePlanIcon = styled.div`
	display: inline-block;
	margin-inline-end: 6px;
`;

const PlanRenewNagContainer = styled.div`
	line-height: 20px;
`;

export default memo( function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();
	const translatedStatus = useSiteLaunchStatusLabel( site );
	const [ inViewOnce, setInViewOnce ] = useState( false );
	const ref = useInView< HTMLTableRowElement >( () => setInViewOnce( true ) );
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );

	const isP2Site = site.options?.is_wpforteams_site;

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
							href={ getDashboardUrl( site.slug ) }
							title={ __( 'Visit Dashboard' ) }
						>
							<SiteItemThumbnail
								displayMode="list"
								showPlaceholder={ ! inViewOnce }
								site={ site }
							/>
						</ListTileLeading>
					}
					title={
						<ListTileTitle>
							<SiteName href={ getDashboardUrl( site.slug ) } title={ __( 'Visit Dashboard' ) }>
								{ site.title }
							</SiteName>
							{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
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
				<SitePlan>
					{ isNotAtomicJetpack( site ) && ! site.plan?.expired && (
						<SitePlanIcon>
							<JetpackLogo size={ 16 } />
						</SitePlanIcon>
					) }
					{ site.plan?.expired ? (
						<PlanRenewNagContainer>
							<PlanRenewNag
								plan={ site.plan }
								isSiteOwner={ site?.site_owner === userId }
								checkoutUrl={ `/checkout/${ site.slug }/${ site.plan?.product_slug }` }
							/>
						</PlanRenewNagContainer>
					) : (
						site.plan?.product_name_short
					) }
				</SitePlan>
			</Column>
			<Column mobileHidden>
				{ translatedStatus }
				<SiteLaunchNag site={ site } />
			</Column>
			<Column mobileHidden>
				{ site.options?.updated_at ? <TimeSince date={ site.options.updated_at } /> : '' }
			</Column>
			<Column mobileHidden>
				{ inViewOnce && (
					<a href={ `/stats/day/${ site.slug }` }>
						<StatsSparkline siteId={ site.ID } showLoader={ true }></StatsSparkline>
					</a>
				) }
			</Column>
			<Column style={ { width: '24px' } }>
				{ inViewOnce && <SitesEllipsisMenu site={ site } /> }
			</Column>
		</Row>
	);
} );
