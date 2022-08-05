import { ListTile, SiteThumbnail } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo } from 'react';
import Image from 'calypso/components/image';
import TimeSince from 'calypso/components/time-since';
import { displaySiteUrl, getDashboardUrl } from '../utils';
import { SiteStatusBadge } from './site-status-badge';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesP2Badge from './sites-p2-badge';
import { SiteName } from './sites-site-name';
import { SiteUrl } from './sites-site-url';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteTableRowProps {
	site: SiteExcerptData;
}

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
`;

const Column = styled.td< { mobileHidden?: boolean } >`
	padding-top: 12px;
	padding-bottom: 12px;
	padding-right: 24px;
	vertical-align: middle;
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-60 );

	@media only screen and ( max-width: 781px ) {
		${ ( props ) => props.mobileHidden && 'display: none;' };
		padding-right: 0;
	}
`;

const SiteListTile = styled( ListTile )`
	line-height: initial;
	margin-right: 0;

	@media only screen and ( max-width: 781px ) {
		margin-right: 12px;
	}
`;

const ListTileLeading = styled.a`
	@media only screen and ( max-width: 781px ) {
		margin-right: 12px;
	}
`;

const ListTileTitle = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 8px;
`;

const ListTileSubtitle = styled.div`
	display: flex;
	align-items: center;
`;

const NoIcon = styled.div( {
	fontSize: 'xx-large',
} );

export default memo( function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();

	const isP2Site = site.options?.is_wpforteams_site;

	const isComingSoon =
		site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

	const shouldUseScreenshot = ! isComingSoon && ! site.is_private;

	return (
		<Row>
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
							<SiteThumbnail
								mShotsUrl={ shouldUseScreenshot ? site.URL : undefined }
								alt={ site.name }
								bgColorImgUrl={ site.icon?.img }
							>
								{ site.icon ? (
									<Image
										src={ site.icon.img }
										alt={ __( 'Site Icon' ) }
										style={ { height: '50px', width: '50px' } }
									/>
								) : (
									<NoIcon role={ 'img' } aria-label={ __( 'Site Icon' ) }>
										{ getFirstGrapheme( site.name ) }
									</NoIcon>
								) }
							</SiteThumbnail>
						</ListTileLeading>
					}
					title={
						<ListTileTitle>
							<SiteName href={ getDashboardUrl( site.slug ) } title={ __( 'Visit Dashboard' ) }>
								{ site.name ? site.name : __( '(No Site Title)' ) }
							</SiteName>
							{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						</ListTileTitle>
					}
					subtitle={
						<ListTileSubtitle>
							<SiteUrl
								className={ css( { lineHeight: 1 } ) }
								href={ site.URL }
								target="_blank"
								rel="noreferrer"
								title={ site.URL }
							>
								{ displaySiteUrl( site.URL ) }
							</SiteUrl>
						</ListTileSubtitle>
					}
				/>
			</Column>
			<Column mobileHidden>{ site.plan.product_name_short }</Column>
			<Column mobileHidden>
				{ site.options?.updated_at ? <TimeSince date={ site.options.updated_at } /> : '' }
			</Column>
			<Column mobileHidden>
				<SiteStatusBadge site={ site } />
			</Column>
			<Column style={ { width: '20px' } }>
				<SitesEllipsisMenu site={ site } />
			</Column>
		</Row>
	);
} );

function getFirstGrapheme( input: string ) {
	// TODO: once we're on Typescript 4.7 we should be able to add this comment:
	//    /// <reference lib="es2022.intl" />
	// to the top of the file to get access to the types for Intl.Segmenter
	// which where added in microsoft/TypeScript#48800
	// In the mean time we need to use the `any` type to fix type errors in CI.

	try {
		const segmenter = new ( Intl as any ).Segmenter();
		const segments = segmenter.segment( input );
		return ( Array.from( segments )[ 0 ] as any ).segment;
	} catch {
		// Intl.Segmenter is not available in all browsers
		return input.charAt( 0 );
	}
}
