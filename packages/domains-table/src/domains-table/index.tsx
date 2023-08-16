import { useI18n } from '@wordpress/react-i18n';
import type { PartialDomainData } from '@automattic/data-stores';
import './style.scss';

interface DomainsTableProps {
	domains: PartialDomainData[] | undefined;
}

export function DomainsTable( { domains }: DomainsTableProps ) {
	const { __ } = useI18n();

	if ( ! domains ) {
		return null;
	}

	return (
		<table className="domains-table">
			<thead>
				<tr>
					<th>{ __( 'Domain', __i18n_text_domain__ ) }</th>
				</tr>
			</thead>
			<tbody>
				{ domains.map( ( { domain } ) => (
					<tr key={ domain }>
						<td>{ domain }</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}
