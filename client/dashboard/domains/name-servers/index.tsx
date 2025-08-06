import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line no-restricted-imports
import useDomainNameserversQuery from 'calypso/data/domains/nameservers/use-domain-nameservers-query';
// eslint-disable-next-line no-restricted-imports
import useUpdateNameserversMutation from 'calypso/data/domains/nameservers/use-update-nameservers-mutation';
import { domainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import './styles.scss';

export default function NameServers() {
	const { domainName } = domainRoute.useParams();
	const { data: nameservers, error: queryError } = useDomainNameserversQuery( domainName );
	const {
		updateNameservers,
		isPending: isUpdatingNameservers,
		error: mutationError,
	} = useUpdateNameserversMutation( domainName );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody className="domains-management__name-servers">
					<NameServersForm
						domainName={ domainName }
						serviceName="WordPress.com"
						queryError={ queryError?.message }
						mutationError={ mutationError?.message }
						isBusy={ isUpdatingNameservers }
						nameservers={ nameservers }
						onSubmit={ updateNameservers }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
