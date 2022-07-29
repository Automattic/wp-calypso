import { ListTile } from '@automattic/components';
import { HighlightMatches } from '@automattic/search';
import { ClassNames, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SiteIcon from 'calypso/blocks/site-icon';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import TimeSince from 'calypso/components/time-since';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteTableRowProps {
	site: SiteExcerptData;
	matches?: ReadonlyArray< SiteTableRowMatch >;
}

export interface SiteTableRowMatch {
	key?: string;
	indices: ReadonlyArray< [ number, number ] >;
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

const displaySiteName = (
	name: string,
	matches: ReadonlyArray< SiteTableRowMatch > | undefined,
	highlightClassname: string,
	__: ReturnType< typeof useI18n >[ '__' ]
) => {
	if ( ! name ) {
		return __( '(No Site Title)' );
	}

	const nameMatches = matches?.find( ( match ) => match.key === 'name' );
	if ( ! nameMatches ) {
		return name;
	}

	return (
		<HighlightMatches
			s={ name }
			ranges={ nameMatches.indices }
			highlightClassname={ highlightClassname }
		/>
	);
};

const displaySiteUrl = (
	siteUrl: string,
	matches: ReadonlyArray< SiteTableRowMatch > | undefined,
	highlightClassname: string
) => {
	const urlMatches = matches?.find( ( match ) => match.key === 'URL' );
	if ( ! urlMatches ) {
		return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
	}

	if ( siteUrl.startsWith( 'https://' ) ) {
		const trimmedUrlMatches = urlMatches.indices.map(
			( [ start, end ] ) => [ start - 8, end - 8 ] as [ number, number ]
		);

		return (
			<HighlightMatches
				s={ siteUrl.substring( 8 ) }
				ranges={ trimmedUrlMatches }
				highlightClassname={ highlightClassname }
			/>
		);
	}

	if ( siteUrl.startsWith( 'http://' ) ) {
		const trimmedUrlMatches = urlMatches.indices.map(
			( [ start, end ] ) => [ start - 7, end - 7 ] as [ number, number ]
		);

		return (
			<HighlightMatches
				s={ siteUrl.substring( 7 ) }
				ranges={ trimmedUrlMatches }
				highlightClassname={ highlightClassname }
			/>
		);
	}

	return (
		<HighlightMatches
			s={ siteUrl.substring( 7 ) }
			ranges={ urlMatches.indices }
			highlightClassname={ highlightClassname }
		/>
	);
};

const VisitDashboardItem = ( { site }: { site: SiteExcerptData } ) => {
	const { __ } = useI18n();
	return (
		<PopoverMenuItem href={ getDashboardUrl( site.slug ) }>
			{ __( 'Visit Dashboard' ) }
		</PopoverMenuItem>
	);
};

export default function SitesTableRow( { site, matches }: SiteTableRowProps ) {
	const { __ } = useI18n();

	const isComingSoon =
		site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );
	const isP2Site = site.options?.is_wpforteams_site;

	const displayStatusBadge = isComingSoon || site.is_private;

	return (
		<ClassNames>
			{ ( { css } ) => {
				const highlightClassname = css`
					background-color: #ffea00;
					border-radius: 4px;
				`;

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
										<SiteIcon siteId={ site.ID } size={ 50 } />
									</ListTileLeading>
								}
								title={
									<ListTileTitle>
										<SiteName
											href={ getDashboardUrl( site.slug ) }
											title={ __( 'Visit Dashboard' ) }
										>
											{ displaySiteName( site.name, matches, highlightClassname, __ ) }
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
											{ displaySiteUrl( site.URL, matches, highlightClassname ) }
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
				);
			} }
		</ClassNames>
	);
}
