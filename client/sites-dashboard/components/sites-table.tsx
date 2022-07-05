import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SiteIcon from 'calypso/blocks/site-icon';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SitesTableProps {
	buildSiteUrl?: ( site: SiteData ) => string;
	className?: string;
	sites: SiteData[];
}

const Table = styled.table`
	border-collapse: collapse;
	table-layout: fixed;
	@media only screen and ( max-width: 781px ) {
		.sites-table__mobile-hidden {
			display: none;
		}
	}
`;

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
	td {
		padding-top: 5px;
		padding-bottom: 5px;
		vertical-align: middle;
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
	font-size: 14px;
	line-height: 20px;
	letter-spacing: -0.24px;
	color: var( --studio-gray-60 );
`;

const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

export function SitesTable( { buildSiteUrl, className, sites }: SitesTableProps ) {
	const { __ } = useI18n();

	return (
		<Table className={ className }>
			<thead className="sites-table__mobile-hidden">
				<Row>
					<th>{ __( 'Site' ) }</th>
					<th>{ __( 'Plan' ) }</th>
					<th>{ __( 'Last Publish' ) }</th>
					<th style={ { width: '20px' } }></th>
				</Row>
			</thead>
			<tbody>
				{ sites.map( ( site ) => (
					<Row key={ site.ID }>
						<td>
							<div style={ { display: 'flex' } }>
								<SiteIcon site={ site } size={ 50 } />
								<div style={ { marginLeft: '20px' } }>
									<SiteName>
										<a href={ buildSiteUrl ? buildSiteUrl( site ) : site.URL }>
											{ site.name ? site.name : __( '(No Site Title)' ) }
										</a>
									</SiteName>
									<SiteUrl href={ site.URL } target="_blank" rel="noreferrer">
										{ displaySiteUrl( site.URL ) }
									</SiteUrl>
								</div>
							</div>
						</td>
						<td className="sites-table__mobile-hidden">{ site.plan.product_name_short }</td>
						<td className="sites-table__mobile-hidden"></td>
						<td style={ { width: '20px' } }>
							<button type="button">
								<Gridicon icon="ellipsis" />
							</button>
						</td>
					</Row>
				) ) }
			</tbody>
		</Table>
	);
}
