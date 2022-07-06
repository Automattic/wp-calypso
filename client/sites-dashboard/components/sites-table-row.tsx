import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SiteIcon from 'calypso/blocks/site-icon';

interface SiteTableRowProps {
	site: Site;
}

interface Site {
	ID: number;
	name: string;
	slug: string;
	URL: string;
	plan: SitePlan;
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

export default function SitesTableRow( { site }: SiteTableRowProps ) {
	const { __ } = useI18n();
	return (
		<Row key={ site.ID }>
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
							{ displaySiteUrl( site.URL ) }
						</SiteUrl>
					</div>
				</div>
			</td>
			<td className="sites-table-row__mobile-hidden">{ site.plan.product_name_short }</td>
			<td className="sites-table-row__mobile-hidden"></td>
			<td style={ { width: '20px' } }>
				<button type="button">
					<Gridicon icon="ellipsis" />
				</button>
			</td>
		</Row>
	);
}
