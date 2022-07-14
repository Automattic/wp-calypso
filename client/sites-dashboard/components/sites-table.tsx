import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SitesTableRow from './sites-table-row';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';

interface SitesTableProps {
	className?: string;
	sites: SiteData[];
	siteBasePath: string;
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
		padding-top: 12px;
		padding-bottom: 12px;
		vertical-align: middle;
		font-size: 14px;
		line-height: 20px;
		letter-spacing: -0.24px;
		color: var( --studio-gray-60 );
	}
`;

export function SitesTable( { className, sites, siteBasePath }: SitesTableProps ) {
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
					<SitesTableRow site={ site } key={ site.ID } siteBasePath={ siteBasePath } />
				) ) }
			</tbody>
		</Table>
	);
}
