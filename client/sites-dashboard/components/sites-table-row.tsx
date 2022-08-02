import { ListTile, SiteThumbnail } from '@automattic/components';
import { ClassNames, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import Image from 'calypso/components/image';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import TimeSince from 'calypso/components/time-since';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
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
		${ ( props ) =>
			props.mobileHidden &&
			css`
				display: none;
			` };

		padding-right: 0;
	}
`;

const SiteName = styled.a`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
	margin-right: 8px;
	font-weight: 500;
	font-size: 16px;
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

	const displayStatusBadge = isComingSoon || site.is_private;
	const setmShotsUrl = ! isComingSoon && ! site.is_private;
	return (
		<ClassNames>
			{ ( { css } ) => (
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
										mShotsUrl={ setmShotsUrl ? site.URL : undefined }
										alt={ site.name }
										bgColorImgUrl={ site.icon?.img }
									>
										{ site.icon ? (
											<Image
												src={ site.icon.img }
												alt={ site.name }
												style={ { height: '50px', width: '50px' } }
												className={ undefined }
											/>
										) : (
											<h1 style={ { fontSize: 'xx-large' } }>{ site.name.charAt( 0 ) }</h1>
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
									{ displayStatusBadge && (
										<div style={ { marginRight: '8px' } }>
											<SitesLaunchStatusBadge>
												{ isComingSoon ? __( 'Coming soon' ) : __( 'Private' ) }
											</SitesLaunchStatusBadge>
										</div>
									) }
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
					<Column style={ { width: '20px' } }>
						<EllipsisMenu>
							<VisitDashboardItem site={ site } />
						</EllipsisMenu>
					</Column>
				</Row>
			) }
		</ClassNames>
	);
}
