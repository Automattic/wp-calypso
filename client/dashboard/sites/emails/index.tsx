import { Email, SiteDomain } from '@automattic/api-core';
import { emailsQuery, siteBySlugQuery, siteDomainsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	ExternalLink,
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { next, wordpress } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { purchasesRoute } from '../../app/router/me';
import { siteRoute } from '../../app/router/sites';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import GoogleLogo from './resources/google-logo';
import type { View } from '@wordpress/dataviews';
import type React from 'react';

import './styles.scss';

const fields = [
	{
		id: 'emailAddress',
		label: __( 'Email Address' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Email } ) => {
			let iconEl = <Icon icon={ wordpress } size={ 28 } className="professional-email-icon" />;
			if ( item.type === 'forwarding' ) {
				iconEl = <Icon icon={ next } size={ 28 } className="email-forwarder-icon" />;
			}

			if ( item.type === 'mailbox' && item.provider === 'google_workspace' ) {
				iconEl = <GoogleLogo size={ 24 } className="google-workspace-email-icon" />;
			}

			return (
				<HStack spacing={ 4 } justify="flex-start">
					<div className="email-icon-wrapper">{ iconEl }</div>
					{ item.type === 'mailbox' ? (
						<ExternalLink href={ `https://mail.${ item.domainName }` }>
							{ item.emailAddress }
						</ExternalLink>
					) : (
						<VStack justify="flex-start">
							<span>{ item.emailAddress }</span>
							<span className="text-muted">
								{ sprintf(
									/* translators: %s is the email messages will be forwarded to. */
									__( 'Forwards to %s' ),
									item.forwardingTo
								) }
							</span>
						</VStack>
					) }
				</HStack>
			);
		},
		getValue: ( { item }: { item: Email } ) => item.emailAddress,
	},
	{
		id: 'domainName',
		label: __( 'Domain' ),
		getValue: ( { item }: { item: Email } ) => item.domainName,
	},
	{
		id: 'type',
		label: __( 'Type' ),
		render: ( { item }: { item: Email } ) =>
			item.type === 'mailbox' ? __( 'Mailbox' ) : __( 'Forwarder' ),
		getValue: ( { item }: { item: Email } ) => item.type,
		elements: [
			{ value: 'mailbox', label: __( 'Mailbox' ) },
			{ value: 'forwarding', label: __( 'Forwarder' ) },
		],
	},
	{
		id: 'status',
		label: __( 'Status' ),
		render: ( { item }: { item: Email } ) => {
			if ( item.status === 'active' ) {
				return __( 'Active' );
			}
			if ( item.status === 'pending' ) {
				return __( 'Pending verification' );
			}
			if ( item.status === 'suspended' ) {
				return __( 'Expired' );
			}
			return item.status;
		},
		getValue: ( { item }: { item: Email } ) => item.status,
		// map to display values for filtering UI
		elements: [
			{ value: 'active', label: __( 'Active' ) },
			{ value: 'pending', label: __( 'Pending verification' ) },
			{ value: 'suspended', label: __( 'Expired' ) },
		],
	},
];

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
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: { field: 'emailAddress', direction: 'asc' },
		fields: [ 'type', 'status' ],
		titleField: 'emailAddress',
	} );

	const actions = useMemo(
		() => [
			{
				id: 'view-mailbox',
				label: __( 'View mailbox' ),
				icon: 'admin-site',
				callback: ( items: Email[] ) => {
					window.open( `https://mail.${ items[ 0 ].domainName }`, '_blank' );
				},
				isEligible: ( item: Email ) => item.type === 'mailbox',
			},
			{
				id: 'manage-subscription',
				label: __( 'Manage subscription' ),
				callback: () => {
					navigate( { to: purchasesRoute.to } );
				},
			},
			{
				id: 'resend-verification',
				label: __( 'Resend verification' ),
				callback: () => {
					// TODO: Wire mutation when available
					// resendForwarderVerificationMutation.mutate({ emailId })
				},
				isEligible: ( item: Email ) => item.type === 'forwarding' && item.status === 'pending',
			},
			{
				id: 'delete',
				label: __( 'Delete' ),
				isDestructive: true,
				callback: () => {
					// TODO: Wire mutation when available
					// deleteEmailMutation.mutate({ emailIds })
					setSelection( [] );
				},
			},
		],
		[ navigate ]
	);

	const isLoading = isDomainsLoading || isEmailsLoading;

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, fields );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Emails' ) } /> }>
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					isLoading={ isLoading }
					fields={ fields }
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
