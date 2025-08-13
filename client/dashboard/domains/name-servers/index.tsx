import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	domainNameServersQuery,
	domainNameServersMutation,
} from '../../app/queries/domain-name-servers';
import { domainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';

export default function NameServers() {
	const { domainName } = domainRoute.useParams();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: nameServers, error: queryError } = useQuery( domainNameServersQuery( domainName ) );

	const { mutate: updateNameServers, isPending: isUpdatingNameServers } = useMutation( {
		...domainNameServersMutation( domainName ),
		onError: ( e: Error ) => createErrorNotice( e.message, { type: 'snackbar' } ),
		onSuccess: () =>
			createSuccessNotice( __( 'Name servers updated successfully.' ), { type: 'snackbar' } ),
	} );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody>
					<NameServersForm
						domainName={ domainName }
						queryError={ queryError?.message }
						isBusy={ isUpdatingNameServers }
						nameServers={ nameServers }
						onSubmit={ updateNameServers }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
