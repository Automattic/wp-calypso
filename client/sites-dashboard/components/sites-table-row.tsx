import styled from '@emotion/styled';
import { Icon, globe, lock, tool } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import SiteIcon from 'calypso/blocks/site-icon';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

interface SiteTableRowProps {
	site: Site;
}

interface Site {
	ID: number;
	name: string;
	slug: string;
	URL: string;
	plan: SitePlan;
	launch_status?: string;
	is_coming_soon?: boolean;
	is_private?: boolean;
}

interface SitePlan {
	product_name_short: string;
}

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
	td {
		padding-top: 12px;
		padding-bottom: 12px;
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
	margin-bottom: 8px;
	a {
		color: inherit;
		&:hover {
			text-decoration: underline;
		}
	}
`;

const SiteUrl = styled.a`
	display: flex;
	align-items: center;
	color: var( --studio-gray-60 );
	&:visited {
		color: var( --studio-gray-60 );
	}
	span {
		margin-left: 4px;
	}
`;

const getDashboardUrl = ( slug: string ) => {
	return '/home/' + slug;
};

const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

const VisitDashboardItem = ( site: Site ) => {
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
	let icon = globe;
	if ( site.is_private && ! isComingSoon ) {
		icon = lock;
	} else if ( isComingSoon ) {
		icon = tool;
	}

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
						<SiteName>
							<a href={ getDashboardUrl( site.slug ) } title={ __( 'Visit Dashboard' ) }>
								{ site.name ? site.name : __( '(No Site Title)' ) }
							</a>
						</SiteName>
						<SiteUrl
							href={ site.URL }
							target="_blank"
							rel="noreferrer"
							title={ __( 'Visit Site' ) }
						>
							<Icon size={ 16 } icon={ icon }></Icon>
							<span>{ displaySiteUrl( site.URL ) }</span>
						</SiteUrl>
					</div>
				</div>
			</td>
			<td className="sites-table-row__mobile-hidden">{ site.plan.product_name_short }</td>
			<td className="sites-table-row__mobile-hidden"></td>
			<td style={ { width: '20px' } }>
				<EllipsisMenu>{ VisitDashboardItem( site ) }</EllipsisMenu>
			</td>
		</Row>
	);
}
