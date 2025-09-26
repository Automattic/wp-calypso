import { Email, SiteDomain } from '@automattic/api-core';
import { emailsQuery, siteDomainsQuery, sitesQuery } from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import NoEmailsEmptyState from './components/NoEmailsEmptyState';
import { createEmailActions, DEFAULT_EMAILS_VIEW, emailFields } from './dataviews';
import { domainHasEmail } from './utils/email-utils';
import type { View } from '@wordpress/dataviews';

import '../sites/emails/styles.scss';

export default function Emails() {
	const navigate = useNavigate();

	const { data: allSites, isLoading: isLoadingSites } = useQuery( sitesQuery() );
	const sites = ( allSites ?? [] ).filter( ( site ) => site.capabilities.manage_options );
	const siteIds = sites.map( ( site ) => site.ID );

	const { data: allEmails, isLoading: isLoadingEmails } = useQuery( emailsQuery() );

	// Fetch site domains for each managed site ID
	const domainsQueries = useQueries( {
		queries: siteIds.map( ( id ) => ( {
			...siteDomainsQuery( id ),
			enabled: Boolean( id ),
		} ) ),
	} );
	const isLoadingDomains = domainsQueries.some( ( q ) => q.isLoading );

	// Aggregate all domains into a single array
	const domains: SiteDomain[] = useMemo( () => {
		if ( isLoadingDomains ) {
			return [];
		}

		// We filter the same way v1 does.
		return domainsQueries
			.flatMap( ( q ) => ( q.data as SiteDomain[] ) ?? [] )
			.filter( ( domain ) => ! domain.wpcom_domain && domainHasEmail( domain ) );
	}, [ domainsQueries, isLoadingDomains ] );

	// Filter emails to those belonging to managed sites by either siteId or matching one of the managed domains
	const emails = ( allEmails ?? [] ).filter( ( e ) => {
		const siteIdMatch = e.siteId && siteIds.includes( Number( e.siteId ) );
		const domainMatch =
			e.domainName && domains.filter( ( domain ) => domain.domain === e.domainName );
		return Boolean( siteIdMatch && domainMatch );
	} );

	const [ selection, setSelection ] = useState< Email[] >( [] );
	const [ view, setView ] = useState< View >( DEFAULT_EMAILS_VIEW );

	const actions = useMemo(
		() => createEmailActions( navigate, setSelection ),
		[ navigate, setSelection ]
	);

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, emailFields );

	return (
		<PageLayout header={ <PageHeader /> } notices={ <OptInWelcome tracksContext="emails" /> }>
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					isLoading={ isLoadingEmails || isLoadingSites || isLoadingDomains }
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
					empty={ <NoEmailsEmptyState /> }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}
