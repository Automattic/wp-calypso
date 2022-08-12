import { ListTile, SiteThumbnail } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import Image from 'calypso/components/image';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import TimeSince from 'calypso/components/time-since';
import SitesP2Badge from './sites-p2-badge';
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

const SiteName = styled.a`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	margin-right: 8px;
	font-weight: 500;
	font-size: 14px;
	letter-spacing: -0.4px;

	&:hover {
		text-decoration: underline;
	}

	&,
	&:hover,
	&:visited {
		color: var( --studio-gray-100 );
	}
`;

const SiteUrl = styled.a`
	text-overflow: ellipsis;
	overflow: hidden;
	display: inline-block;
	line-height: 1;

	&,
	&:hover,
	&:visited {
		color: var( --studio-gray-60 );
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

const getDashboardUrl = ( slug: string ) => {
	return '/home/' + slug;
};

const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

const VisitDashboardItem = ( { site }: { site: SiteExcerptData } ) => {
	const { __ } = useI18n();
	return (
		<PopoverMenuItem href={ getDashboardUrl( site.slug ) }>
			{ __( 'Visit Dashboard' ) }
		</PopoverMenuItem>
	);
};

export default function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();

	const isComingSoon =
		site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );
	const isP2Site = site.options?.is_wpforteams_site;

	let siteStatusLabel = __( 'Public' );

	if ( isComingSoon ) {
		siteStatusLabel = __( 'Coming soon' );
	} else if ( site.is_private ) {
		siteStatusLabel = __( 'Private' );
	}
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
							<SiteUrl href={ site.URL } target="_blank" rel="noreferrer" title={ site.URL }>
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
			<Column mobileHidden>{ siteStatusLabel }</Column>
			<Column style={ { width: '20px' } }>
				<EllipsisMenu>
					<VisitDashboardItem site={ site } />
				</EllipsisMenu>
			</Column>
		</Row>
	);
}

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
