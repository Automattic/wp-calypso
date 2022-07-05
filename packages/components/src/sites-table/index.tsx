import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import type { SiteData } from 'calypso/state/ui/selectors/site-data'; // eslint-disable-line no-restricted-imports

interface SitesTableProps {
	buildSiteUrl?: ( site: SiteData ) => string;
	className?: string;
	sites: SiteData[];
}

const Table = styled.table`
	border-collapse: collapse;
	table-layout: fixed;
`;

const Row = styled.tr`
	line-height: 2em;
	border-bottom: 1px solid #eee;
`;

export function SitesTable( { buildSiteUrl, className, sites }: SitesTableProps ) {
	const { __ } = useI18n();

	return (
		<Table className={ className }>
			<thead>
				<Row>
					<th>{ __( 'Site', __i18n_text_domain__ ) }</th>
					<th>{ __( 'Plan', __i18n_text_domain__ ) }</th>
				</Row>
			</thead>
			<tbody>
				{ sites.map( ( site ) => (
					<Row key={ site.ID }>
						<td>
							<a href={ buildSiteUrl ? buildSiteUrl( site ) : site.URL }>{ site.name }</a>
						</td>
						<td>{ site.plan.product_name_short }</td>
					</Row>
				) ) }
			</tbody>
		</Table>
	);
}
