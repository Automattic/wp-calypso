import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink, Notice } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { emailsQuery } from '../app/queries';
import DataViewsCard from '../dataviews-card';
import PageLayout from '../page-layout';
import type { Email } from '../data/types';
import type { View, Field, Action } from '@wordpress/dataviews';

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
] as Field< Email >[];

function Emails() {
	const navigate = useNavigate();
	const emails = useQuery( emailsQuery() ).data as Email[];
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

	const actions: Action< Email >[] = useMemo(
		() => [
			{
				id: 'manage',
				label: __( 'Manage' ),
				callback: ( [ item ] ) => {
					navigate( { to: `/emails/${ item.id }` } );
				},
			},
			{
				id: 'edit',
				label: __( 'Edit' ),
				callback: ( [ item ] ) => {
					navigate( { to: `/emails/${ item.id }/edit` } );
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
		],
		[ navigate ]
	);

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, fields );

	const onClickItem = ( item: Email ) => {
		navigate( { to: `/emails/${ item.id }` } );
	};

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
