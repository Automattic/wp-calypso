import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line no-restricted-imports
import useDomainNameserversQuery from 'calypso/data/domains/nameservers/use-domain-nameservers-query';
import { domainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import './styles.scss';

export default function NameServers() {
	const { domainName } = domainRoute.useParams();
	const { data: nameservers } = useDomainNameserversQuery( domainName );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody className="domains-management__name-servers">
					<NameServersForm
						nameservers={ nameservers }
						onSubmit={ () => {
							// TODO: Implement nameserver update
						} }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
