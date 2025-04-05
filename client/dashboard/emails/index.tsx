import { Button, Card, ExternalLink } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { fetchEmails, type EmailObject } from '../data';
import PageLayout from '../page-layout';
import type { View, Field } from '@wordpress/dataviews';
import type { LoaderFunction } from 'react-router-dom';

function Emails() {
	const navigate = useNavigate();
	const emails = useLoaderData() as EmailObject[];
	const [ selection, setSelection ] = useState< EmailObject[] >( [] );

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

	// Field definitions
	const fields = [
		{
			id: 'emailAddress',
			label: __( 'Email Address' ),
			enableGlobalSearch: true,
			render: ( { item } ) =>
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
			render: ( { item } ) => ( item.type === 'mailbox' ? __( 'Mailbox' ) : __( 'Forwarding' ) ),
			getValue: ( { item } ) => item.type,
			elements: [
				{ value: 'mailbox', label: __( 'Mailbox' ) },
				{ value: 'forwarding', label: __( 'Forwarding' ) },
			],
		},
		{
			id: 'provider',
			label: __( 'Provider' ),
			render: ( { item } ) => {
				if ( item.type === 'forwarding' && item.forwardingTo ) {
					return `${ __( 'Forwards to' ) } ${ item.forwardingTo }`;
				}

				// Display the provider display name from the data
				// This keeps the component agnostic while showing user-friendly names
				return item.providerDisplayName;
			},
			getValue: ( { item } ) => item.provider,
		},
	] as Field< EmailObject >[];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, fields );

	const onClickItem = ( item: EmailObject ) => {
		navigate( `/emails/${ item.id }` );
	};

	// Define actions
	const actions = [
		// Regular actions
		{
			id: 'manage',
			label: __( 'Manage' ),
			callback: ( [ item ] ) => {
				navigate( `/emails/${ item.id }` );
			},
		},
		{
			id: 'edit',
			label: __( 'Edit' ),
			callback: ( [ item ] ) => {
				navigate( `/emails/${ item.id }/edit` );
			},
		},
		{
			id: 'access-webmail',
			label: __( 'Access Webmail' ),
			callback: ( [ item ] ) => {
				window.open( `https://mail.${ item.domainName }`, '_blank' );
			},
			isEligible: ( item ) => item.type === 'mailbox',
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
	];

	return (
		<PageLayout
			title={ __( 'Emails' ) }
			actions={
				<div style={ { display: 'flex', gap: '12px' } }>
					<Button variant="secondary" __next40pxDefaultSize>
						{ __( 'Add Email Forwarder' ) }
					</Button>
					<Button variant="primary" __next40pxDefaultSize>
						{ __( 'Add Mailbox' ) }
					</Button>
				</div>
			}
		>
			<Card>
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
			</Card>
		</PageLayout>
	);
}

Emails.loader = fetchEmails satisfies LoaderFunction;

export default Emails;
