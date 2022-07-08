import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SiteIcon from 'calypso/blocks/site-icon';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SiteTableRowProps {
	site: SiteData;
}

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
	td {
		padding-top: 12px;
		padding-bottom: 12px;
		padding-right: 24px;
		vertical-align: middle;
		font-size: 14px;
		line-height: 20px;
		letter-spacing: -0.24px;
		color: var( --studio-gray-60 );
	}
	@media only screen and ( max-width: 781px ) {
		.sites-table-row__mobile-hidden {
			display: none;
		}
	}
`;

const SiteName = styled.h2`
	font-weight: 500;
	font-size: 16px;
	letter-spacing: -0.4px;
	color: var( --studio-gray-100 );
	a {
		color: inherit;
		&:hover {
			text-decoration: underline;
		}
	}
`;

const SiteUrl = styled.a`
	color: var( --studio-gray-60 );
	&:visited {
		color: var( --studio-gray-60 );
	}
`;

const getDashboardUrl = ( slug: string ) => {
	return '/home/' + slug;
};

const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

const VisitDashboardItem = ( { site }: { site: SiteData } ) => {
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

	return (
		<Row>
			<td>
				<div style={ { display: 'flex', alignItems: 'center' } }>
					<a
						style={ { display: 'block' } }
						href={ getDashboardUrl( site.slug ) }
						title={ __( 'Visit Dashboard' ) }
					>
						<SiteIcon siteId={ site.ID } size={ 50 } />
					</a>
					<div style={ { marginLeft: '20px' } }>
						<div style={ { display: 'flex', alignItems: 'center', marginBottom: '8px' } }>
							<SiteName style={ { marginRight: '8px' } }>
								<a href={ getDashboardUrl( site.slug ) } title={ __( 'Visit Dashboard' ) }>
									{ site.name ? site.name : __( '(No Site Title)' ) }
								</a>
							</SiteName>
							{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						</div>
						<div>
							<SiteUrl
								href={ site.URL }
								target="_blank"
								rel="noreferrer"
								title={ __( 'Visit Site' ) }
								style={ { marginRight: '8px' } }
							>
								{ displaySiteUrl( site.URL ) }
							</SiteUrl>
							{ site.is_private && ! isComingSoon && (
								<SitesLaunchStatusBadge>Private</SitesLaunchStatusBadge>
							) }
							{ isComingSoon && <SitesLaunchStatusBadge>Coming soon</SitesLaunchStatusBadge> }
						</div>
					</div>
				</div>
			</td>
			<td className="sites-table-row__mobile-hidden">{ site.plan.product_name_short }</td>
			<td className="sites-table-row__mobile-hidden">July 16, 1969</td>
			<td style={ { width: '20px' } }>
				<EllipsisMenu>
					<VisitDashboardItem site={ site } />
				</EllipsisMenu>
			</td>
		</Row>
	);
}
