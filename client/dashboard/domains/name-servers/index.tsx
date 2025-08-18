import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useCallback } from 'react';
import { domainQuery } from '../../app/queries/domain';
import {
	domainNameServersQuery,
	domainNameServersMutation,
} from '../../app/queries/domain-name-servers';
import { domainRoute } from '../../app/router';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';

export default function NameServers() {
	const { domainName } = domainRoute.useParams();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: nameServers, error: queryError } = useQuery( domainNameServersQuery( domainName ) );
	const { mutate: updateNameServers, isPending: isUpdatingNameServers } = useMutation(
		domainNameServersMutation( domainName )
	);
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	const errorMsg = useMemo( () => {
		if ( ! domain?.can_manage_name_servers ) {
			return (
				domain?.cannot_manage_name_servers_reason ||
				__( 'You do not have permission to manage name servers.' )
			);
		}

		if ( queryError ) {
			return queryError.message;
		}
	}, [ domain, queryError ] );

	const onSubmit = useCallback(
		( ns: string[] ) => {
			updateNameServers( ns, {
				onSuccess: () => {
					createSuccessNotice( __( 'Name servers updated successfully.' ), {
						type: 'snackbar',
					} );
				},
				onError: ( e: Error ) => createErrorNotice( e.message, { type: 'snackbar' } ),
			} );
		},
		[ updateNameServers, createSuccessNotice, createErrorNotice ]
	);

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody>
					{ errorMsg ? (
						<Notice variant="error">{ errorMsg }</Notice>
					) : (
						<NameServersForm
							domainName={ domainName }
							isBusy={ isUpdatingNameServers }
							nameServers={ nameServers ?? [] }
							onSubmit={ onSubmit }
						/>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
