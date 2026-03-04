import { dashboardSiteIssuesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';

export default function SiteIssues() {
	const { data } = useQuery( dashboardSiteIssuesQuery() );
	const disconnectedAtomicSites = data?.disconnected_atomic_sites ?? [];

	if ( disconnectedAtomicSites.length === 0 ) {
		return null;
	}

	return (
		<Notice variant="error" title={ __( 'You have inaccessible sites' ) }>
			<p>
				{ __( 'You no longer have access to the following sites. Please review and take action.' ) }
			</p>

			<ul>
				{ disconnectedAtomicSites.map( ( site ) => (
					<li key={ site.ID }>
						<Link to={ `/sites/${ site.slug }` }>{ site.slug }</Link>
					</li>
				) ) }
			</ul>
		</Notice>
	);
}
