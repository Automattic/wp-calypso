import {
	Card,
	CardBody,
	SearchControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

export default function DomainTransferToOtherSite() {
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
							description={ __( 'Attach haven.co to a site you’re an administrator of:' ) }
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
