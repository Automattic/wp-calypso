import { DomainSubtype } from '@automattic/api-core';
import { domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import InboundTransfer from './inbound-transfer';
import OutboundTransfer from './outbound-transfer';

export default function DomainTransfer() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const isInboundTransfer = domain.subtype.id === DomainSubtype.DOMAIN_TRANSFER;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Transfer' ) }
					description={ __( 'Transfer this domain to another site or WordPress.com user.' ) }
				/>
			}
		>
			{ isInboundTransfer ? (
				<InboundTransfer domain={ domain } />
			) : (
				<OutboundTransfer domain={ domain } />
			) }
		</PageLayout>
	);
}
