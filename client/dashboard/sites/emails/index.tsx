import { Email, SiteDomain } from '@automattic/api-core';
import { emailsQuery, siteBySlugQuery, siteDomainsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import './styles.scss';
import { createEmailActions, DEFAULT_EMAILS_VIEW, emailFields } from '../../emails/dataviews';
import type { View } from '@wordpress/dataviews';

function SiteEmails() {
	const navigate = useNavigate();
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: domains, isLoading: isDomainsLoading } = useQuery( siteDomainsQuery( site.ID ) );
	const { data: allEmails, isLoading: isEmailsLoading } = useQuery( emailsQuery() );

	// Filter emails to those belonging to this site by either siteId or matching one of the site's domains
	const siteDomainNames = new Set( ( domains ?? [] ).map( ( d: SiteDomain ) => d.domain ) );
	const emails = ( allEmails ?? [] ).filter( ( e ) => {
		const siteIdMatch = e.siteId && Number( e.siteId ) === site?.ID;
		const domainMatch = e.domainName && siteDomainNames.has( e.domainName );
		return siteIdMatch || domainMatch;
	} );

	const [ selection, setSelection ] = useState< Email[] >( [] );
	const [ view, setView ] = useState< View >( DEFAULT_EMAILS_VIEW );

	const actions = useMemo(
		() => createEmailActions( navigate, setSelection ),
		[ navigate, setSelection ]
	);

	const isLoading = isDomainsLoading || isEmailsLoading;

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, emailFields );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Emails' ) } /> }>
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					isLoading={ isLoading }
					fields={ emailFields }
					view={ view }
					onChangeView={ setView }
					selection={ selection.map( ( item ) => item.id ) }
					onChangeSelection={ ( ids ) =>
						setSelection( emails.filter( ( email ) => ids.includes( email.id ) ) )
					}
					actions={ actions }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default SiteEmails;
