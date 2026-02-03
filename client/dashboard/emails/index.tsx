import { DomainSubtype, EmailBox } from '@automattic/api-core';
import { domainsQuery, userMailboxesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { usePersistentView } from '../app/hooks/use-persistent-view';
import { addEmailForwarderRoute, chooseDomainRoute, emailsRoute } from '../app/router/emails';
import { DataViews, DataViewsCard } from '../components/dataviews';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import UnusedMailboxNotice from './components/unused-mailbox-notice';
import { DEFAULT_VIEW, getFields, useActions } from './dataviews';
import EmptyDomainsState from './empty-domains-state';
import EmptyMailboxesState from './empty-mailboxes-state';
import { mapMailboxToEmail } from './mappers/mailbox-to-email-mapper';
import type { Email } from './types';

import './style.scss';

function Emails() {
	const navigate = useNavigate();
	const { data: allEmailAccounts } = useSuspenseQuery( userMailboxesQuery() );
	const { domainName: domainNameFilter }: { domainName?: string } = emailsRoute.useSearch();
	const { data: allDomains } = useSuspenseQuery( domainsQuery() );
	const domains = ( allDomains ?? [] ).filter(
		( d ) => d.current_user_is_owner && d.subtype.id !== DomainSubtype.DEFAULT_ADDRESS
	);

	// Aggregate all domains into a single array
	const domainsWithEmails = useMemo( () => {
		const domainsWithEmailsList =
			allEmailAccounts?.map( ( mailbox ) => mailbox.domains[ 0 ].domain ) ?? [];
		return domains.filter( ( d ) => domainsWithEmailsList.includes( d.domain ) );
	}, [ allEmailAccounts, domains ] );

	const emails: Email[] = useMemo( () => {
		if ( ! allEmailAccounts?.length ) {
			return [];
		}
		return allEmailAccounts
			.flatMap( ( account ) =>
				account.emails.map( ( box: EmailBox ) => mapMailboxToEmail( box, account ) )
			)
			.filter( ( email ) => email.canUserManage ) as Email[];
	}, [ allEmailAccounts ] );

	// Gather domains with unused mailbox warnings
	const domainsWithUnusedMailbox: string[] = useMemo( () => {
		if ( ! allEmailAccounts?.length ) {
			return [];
		}
		const warnedDomains = new Set< string >();
		for ( const account of allEmailAccounts ) {
			const hasUnusedWarning = ( account.warnings ?? [] ).some(
				( w ) => w.warning_slug === 'unused_mailboxes'
			);
			if ( hasUnusedWarning ) {
				warnedDomains.add( account.domains[ 0 ].domain );
			}
		}

		// Return only domains we show in the table (i.e., that actually have emails)
		return domainsWithEmails
			.filter( ( d ) => warnedDomains.has( d.domain ) )
			.map( ( d ) => d.domain );
	}, [ domainsWithEmails, allEmailAccounts ] );

	const [ selection, setSelection ] = useState< Email[] >( [] );

	const searchParams = emailsRoute.useSearch();

	const { view, updateView, resetView } = usePersistentView( {
		slug: 'emails',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
		queryParamFilterFields: [ 'domainName' ],
	} );

	const actions = useActions();

	const emailFields = getFields( domainsWithEmails, domainNameFilter );

	const { data: filteredData, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( emails, view, emailFields );
	}, [ emails, view, emailFields ] );

	const hasNoDomains = domains.length === 0;
	const hasNoEmails = emails.length === 0;

	const renderContent = () => {
		if ( hasNoDomains ) {
			return <EmptyDomainsState />;
		}

		if ( hasNoEmails ) {
			return <EmptyMailboxesState />;
		}

		return (
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					fields={ emailFields }
					view={ view }
					onChangeView={ updateView }
					onResetView={ resetView }
					selection={ selection.map( ( item ) => item.id ) }
					onChangeSelection={ ( ids ) =>
						setSelection( emails.filter( ( email ) => ids.includes( email.id ) ) )
					}
					actions={ actions }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		);
	};

	const showActions = ! hasNoDomains && ! hasNoEmails;

	return (
		<PageLayout
			header={
				<PageHeader
					actions={
						showActions ? (
							<>
								<Button
									className="emails__add-email-forwarder"
									variant="secondary"
									__next40pxDefaultSize
									onClick={ () => navigate( { to: addEmailForwarderRoute.to } ) }
								>
									{ __( 'Add email forwarder' ) }
								</Button>
								<Button
									variant="primary"
									__next40pxDefaultSize
									onClick={ () => navigate( { to: chooseDomainRoute.to } ) }
								>
									{ __( 'Add mailbox' ) }
								</Button>
							</>
						) : null
					}
				/>
			}
			notices={ <OptInWelcome tracksContext="emails" /> }
		>
			<UnusedMailboxNotice domains={ domainsWithUnusedMailbox } />
			{ renderContent() }
		</PageLayout>
	);
}

export default Emails;
