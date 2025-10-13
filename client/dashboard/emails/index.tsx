import { EmailAccount, EmailBox, SiteDomain } from '@automattic/api-core';
import { mailboxAccountsQuery } from '@automattic/api-queries';
import { useQueries } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useMemo, useState } from 'react';
import { emailsRoute } from '../app/router/emails';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { domainHasEmail } from '../utils/domain';
import { persistViewToUrl, useSetInitialViewFromUrl } from '../utils/persist-view-to-url';
import NoDomainsAvailableEmptyState from './components/no-domains-available-empty-state';
import NoEmailsAvailableEmptyState from './components/no-emails-available-empty-state';
import { DEFAULT_EMAILS_VIEW, getEmailFields, useEmailActions } from './dataviews';
import { useDomains } from './hooks/use-domains';
import { mapMailboxToEmail } from './mappers/mailbox-to-email-mapper';
import type { Email } from './types';
import type { View } from '@wordpress/dataviews';

import './style.scss';

function Emails() {
	const { domainName }: { domainName?: string } = emailsRoute.useSearch();
	const { domains, isLoading: isLoadingDomains } = useDomains();

	// Aggregate all domains into a single array
	const { domainsWithEmails, domainsWithoutEmails } = useMemo( () => {
		if ( isLoadingDomains ) {
			return { domainsWithEmails: [], domainsWithoutEmails: [] };
		}

		// We filter the same way v1 does.
		const nonWpcomDomains = domains.filter( ( domain ) => ! domain.wpcom_domain );

		const domainsWithEmails = nonWpcomDomains.filter( domainHasEmail ) as SiteDomain[];
		const domainsWithoutEmails = nonWpcomDomains.filter(
			( domain ) => ! domainHasEmail( domain )
		) as SiteDomain[];

		return { domainsWithEmails, domainsWithoutEmails };
	}, [ domains, isLoadingDomains ] );

	const mailboxQueries = useQueries( {
		queries: domainsWithEmails.map( ( domain: SiteDomain ) =>
			mailboxAccountsQuery( domain.blog_id, domain.domain )
		),
	} );

	const isLoadingMailboxes = mailboxQueries.some( ( q ) => q.isLoading );

	// Build emails by pairing each domain with its corresponding mailboxes query
	const emails: Email[] = useMemo( () => {
		if ( ! domainsWithEmails.length ) {
			return [];
		}
		return domainsWithEmails.flatMap( ( domain, index ) => {
			const mailboxes = ( mailboxQueries[ index ]?.data as EmailAccount[] ) ?? [];

			const skipFilterForwards = mailboxes.length === 1;

			return mailboxes
				.filter( ( account ) => skipFilterForwards || account.account_type !== 'email_forwarding' )
				.flatMap( ( account ) =>
					account.emails.map( ( box: EmailBox ) => mapMailboxToEmail( box, account, domain ) )
				)
				.filter( ( email ) => email.canUserManage ) as Email[];
		} );
	}, [ domainsWithEmails, mailboxQueries ] );

	const [ selection, setSelection ] = useState< Email[] >( [] );
	const [ view, setView ] = useState< View >( DEFAULT_EMAILS_VIEW );
	useSetInitialViewFromUrl( {
		fieldName: 'domainName',
		fieldValue: domainName,
		setView,
	} );

	const actions = useEmailActions();

	const emailFields = getEmailFields( domainsWithEmails );

	const onChangeView = ( newView: View ) => {
		persistViewToUrl( newView, 'domainName' );
		setView( newView );
	};

	const { data: filteredData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( emails, view, emailFields );
	}, [ emails, view, emailFields ] );

	let emptyState = null;
	if ( emails.length === 0 ) {
		emptyState = domainsWithoutEmails ? (
			<NoEmailsAvailableEmptyState />
		) : (
			<NoDomainsAvailableEmptyState />
		);
	}

	return (
		<PageLayout header={ <PageHeader /> } notices={ <OptInWelcome tracksContext="emails" /> }>
			<DataViewsCard>
				<div className="emails__dataviews">
					<DataViews
						data={ filteredData }
						isLoading={ isLoadingDomains || isLoadingMailboxes }
						fields={ emailFields }
						view={ view }
						onChangeView={ onChangeView }
						selection={ selection.map( ( item ) => item.id ) }
						onChangeSelection={ ( ids ) =>
							setSelection( emails.filter( ( email ) => ids.includes( email.id ) ) )
						}
						actions={ actions }
						defaultLayouts={ { table: {} } }
						paginationInfo={ paginationInfo }
						empty={ emptyState }
					/>
				</div>
			</DataViewsCard>
		</PageLayout>
	);
}

export default Emails;
