import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import { domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { SelectSite } from './select-site';
import type { Site } from '@automattic/api-core';

export default function DomainTransferToOtherSite() {
	const { domainName } = domainTransferToOtherSiteRoute.useParams();
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const [ selectedSite, setSelectedSite ] = useState< Site >();

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
						<SelectSite
							onSiteSelect={ ( site ) => {
								setSelectedSite( site );
								setIsConfirmDialogOpen( true );
							} }
						/>
					</VStack>
				</CardBody>
			</Card>
			<ConfirmDialog
				isOpen={ !! selectedSite && isConfirmDialogOpen }
				confirmButtonText={ __( 'Confirm attachment' ) }
				onConfirm={ () => setIsConfirmDialogOpen( false ) }
				onCancel={ () => setIsConfirmDialogOpen( false ) }
			>
				<VStack spacing={ 4 } style={ { maxWidth: '450px' } }>
					<Text as="p">
						{ sprintf(
							// translators: %1$s is the domain name, %2$s is the site name
							__( 'Do you want to attach %1$s to site %2$s?' ),
							domainName,
							selectedSite?.name ?? ''
						) }
					</Text>
					{ /* TODO: Show this paragraph when we have a select site object to check if the target site has a paid plan */ }
					<Text as="p">
						{ __(
							'The target site doesn’t have a paid plan, so you won’t be able to set this domain as primary on the site.'
						) }
					</Text>
				</VStack>
			</ConfirmDialog>
		</PageLayout>
	);
}
