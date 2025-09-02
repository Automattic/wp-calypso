import {
	Card,
	CardBody,
	SearchControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

export default function DomainTransferToOtherSite() {
	const { domainName } = domainTransferToOtherSiteRoute.useParams();

	return (
		<PageLayout
			size="small"
			header={ <PageHeader title={ __( 'To another WordPress.com site' ) } /> }
		>
			<Card>
				<CardBody>
					<VStack spacing={ 10 }>
						<SectionHeader
							title={ __( 'Confirm new owner' ) }
							description={ sprintf(
								// translators: %s is the domain name
								__( 'Attach %s to a site you’re an administrator of:' ),
								domainName
							) }
							level={ 3 }
						/>
						<div>
							<SearchControl onChange={ () => {} } />
						</div>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
