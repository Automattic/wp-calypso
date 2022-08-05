import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import SitesTableRow from './sites-table-row';
import SitesTableRowLoading from './sites-table-row-loading';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const N_LOADING_ROWS = 3;

interface SitesTableProps {
	className?: string;
	sites: SiteExcerptData[];
	isLoading?: boolean;
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
	th {
		padding-top: 12px;
		padding-bottom: 12px;
		vertical-align: middle;
		font-size: 14px;
		line-height: 20px;
		letter-spacing: -0.24px;
		font-weight: normal;
		color: var( --studio-gray-60 );
	}
`;

export function SitesTable( { className, sites, isLoading = false }: SitesTableProps ) {
	const { __ } = useI18n();

	return (
		<Table className={ className }>
			<thead className="sites-table__mobile-hidden">
				<Row>
					<th style={ { width: '50%' } }>{ __( 'Site' ) }</th>
					<th style={ { width: '20%' } }>{ __( 'Plan' ) }</th>
					<th>{ __( 'Last Publish' ) }</th>
					<th>{ __( 'Status' ) }</th>
					<th style={ { width: '20px' } }></th>
				</Row>
			</thead>
			<tbody>
				{ isLoading &&
					Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => (
							<SitesTableRowLoading
								columns={ 5 }
								delayMS={ i * 150 }
								logoProps={ { width: 200, height: 50 } }
							/>
						) ) }
				{ sites.map( ( site ) => (
					<SitesTableRow site={ site } key={ site.ID }></SitesTableRow>
				) ) }
			</tbody>
		</Table>
	);
}
