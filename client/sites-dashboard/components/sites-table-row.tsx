import { ListTile, useSiteLaunchStatusLabel } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo } from 'react';
import TimeSince from 'calypso/components/time-since';
import { displaySiteUrl, getDashboardUrl } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesP2Badge from './sites-p2-badge';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
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

export default memo( function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();
	const translatedStatus = useSiteLaunchStatusLabel( site );

	const isP2Site = site.options?.is_wpforteams_site;

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
							<SiteItemThumbnail site={ site } />
						</ListTileLeading>
					}
					title={
						<ListTileTitle>
							<SiteName href={ getDashboardUrl( site.slug ) } title={ __( 'Visit Dashboard' ) }>
								{ site.name }
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
			<Column mobileHidden>{ translatedStatus }</Column>
			<Column style={ { width: '20px' } }>
				<SitesEllipsisMenu site={ site } />
			</Column>
		</Row>
	);
} );
