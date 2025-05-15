import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { emailsQuery } from '../app/queries';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import type { Email } from '../data/types';
import type { View } from '@automattic/dataviews';

const fields = [
	{
		id: 'emailAddress',
		label: __( 'Email Address' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Email } ) =>
			item.type === 'mailbox' ? (
				<ExternalLink href={ `https://mail.${ item.domainName }` }>
					{ item.emailAddress }
				</ExternalLink>
			) : (
				item.emailAddress
			),
	},
	{
		id: 'type',
		label: __( 'Type' ),
		render: ( { item }: { item: Email } ) =>
			item.type === 'mailbox' ? __( 'Mailbox' ) : __( 'Forwarding' ),
		getValue: ( { item }: { item: Email } ) => item.type,
		elements: [
			{ value: 'mailbox', label: __( 'Mailbox' ) },
			{ value: 'forwarding', label: __( 'Forwarding' ) },
		],
	},
	{
		id: 'provider',
		label: __( 'Provider' ),
		render: ( { item }: { item: Email } ) => {
			if ( item.type === 'forwarding' && item.forwardingTo ) {
				return `${ __( 'Forwards to' ) } ${ item.forwardingTo }`;
			}

			// Display the provider display name from the data
			// This keeps the component agnostic while showing user-friendly names
			return item.providerDisplayName;
		},
		getValue: ( { item }: { item: Email } ) => item.provider,
	},
];

function Emails() {
	const navigate = useNavigate();
	const emails = useQuery( emailsQuery() ).data;
	const [ selection, setSelection ] = useState< Email[] >( [] );

	// View config
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'emailAddress',
			direction: 'asc',
		},
		fields: [ 'type', 'provider' ],
		titleField: 'emailAddress',
	} );

	const actions = useMemo(
		() => [
			{
				id: 'manage',
				label: __( 'Manage' ),
				callback: ( items: Email[] ) => {
					navigate( { to: `/emails/${ items[ 0 ].id }` } );
				},
			},
			{
				id: 'edit',
				label: __( 'Edit' ),
				callback: ( items: Email[] ) => {
					navigate( { to: `/emails/${ items[ 0 ].id }/edit` } );
				},
			},
			{
				id: 'access-webmail',
				label: __( 'Access Webmail' ),
				callback: ( items: Email[] ) => {
					window.open( `https://mail.${ items[ 0 ].domainName }`, '_blank' );
				},
				isEligible: ( item: Email ) => item.type === 'mailbox',
			},
			{
				id: 'delete',
				label: __( 'Delete' ),
				callback: () => {
					setSelection( [] );
				},
				isDestructive: true,
				supportsBulk: true,
			},
		],
		[ navigate ]
	);

	if ( ! emails ) {
		return;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, fields );

	const onClickItem = ( item: Email ) => {
		navigate( { to: `/emails/${ item.id }` } );
	};

	return (
		<PageLayout>
			<PageHeader
				title={ __( 'Emails' ) }
				actions={
					<>
						<Button variant="secondary" __next40pxDefaultSize>
							{ __( 'Add Email Forwarder' ) }
						</Button>
						<Button variant="primary" __next40pxDefaultSize>
							{ __( 'Add Mailbox' ) }
						</Button>
					</>
				}
			/>
			<Notice status="warning" isDismissible={ false }>
				{ __( 'This is using fake data for the moment' ) }
			</Notice>
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					onClickItem={ onClickItem }
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

export default Emails;
