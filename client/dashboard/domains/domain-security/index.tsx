import { domainQuery, sslDetailsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { isTldInMaintenance } from '../../utils/domain';
import { TLDMaintenanceNotice } from '../maintenance-notice';
import DnsSec from './dnssec';
import SslCertificate from './ssl-certificate';

export default function DomainSecurity() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: sslDetails } = useSuspenseQuery( sslDetailsQuery( domainName ) );

	const isInMaintenance = isTldInMaintenance( domain );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ __(
						'Manage security settings for your domain, including SSL certificates.'
					) }
				/>
			}
			notices={ isInMaintenance ? <TLDMaintenanceNotice showGoBackLink={ false } /> : undefined }
		>
			{ ! isInMaintenance && (
				<>
					<SslCertificate domainName={ domainName } domain={ domain } sslDetails={ sslDetails } />
					<DnsSec domainName={ domainName } domain={ domain } />
				</>
			) }
		</PageLayout>
	);
}
