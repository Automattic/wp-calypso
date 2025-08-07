import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAppContext } from '../../app/context';
import {
	domainNameserversQuery,
	domainNameserversUpdateMutation,
} from '../../app/queries/domain-nameservers';
import { domainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import './styles.scss';

export default function NameServers() {
	const { instanceType } = useAppContext();
	const { domainName } = domainRoute.useParams();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: nameservers, error: queryError } = useQuery( domainNameserversQuery( domainName ) );

	const { mutate: updateNameservers, isPending: isUpdatingNameservers } = useMutation( {
		...domainNameserversUpdateMutation( domainName ),
		onError: ( e: Error ) => createErrorNotice( e.message, { type: 'snackbar' } ),
		onSuccess: () =>
			createSuccessNotice( __( 'Nameservers updated successfully.' ), { type: 'snackbar' } ),
	} );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody className="domains-management__name-servers">
					<NameServersForm
						domainName={ domainName }
						instanceType={ instanceType }
						queryError={ queryError?.message }
						isBusy={ isUpdatingNameservers }
						nameservers={ nameservers }
						onSubmit={ updateNameservers }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
