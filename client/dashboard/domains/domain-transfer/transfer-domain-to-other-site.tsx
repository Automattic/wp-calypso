import { transferDomainToSiteMutation, domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Modal,
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute, domainTransferToOtherSiteRoute } from '../../app/router/domains';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { getCreateSiteFromDomainOnlyUrl } from '../../utils/domain-url';
import { SelectSite } from './select-site';
import type { Site } from '@automattic/api-core';

export default function DomainTransferToOtherSite() {
	const navigate = useNavigate();
	const { domainName } = domainTransferToOtherSiteRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const [ selectedSite, setSelectedSite ] = useState< Site >();
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );

	const { mutate: transferDomainToSite, isPending: isTransferringDomain } = useMutation(
		withSnackbar( transferDomainToSiteMutation( domainName, domain?.blog_id ?? 0 ), {
			success: __( 'Domain transferred successfully.' ),
			error: { source: 'server' },
		} )
	);

	const onConfirmTransfer = () => {
		if ( ! selectedSite ) {
			return;
		}
		transferDomainToSite( selectedSite.ID, {
			onSuccess: () => {
				setIsConfirmDialogOpen( false );
				navigate( { to: domainRoute.fullPath, params: { domainName } } );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Attach to another site' ) }
					description={ sprintf(
						// translators: %s is the domain name
						__( 'Attach %s to a site you’re an administrator of:' ),
						domainName
					) }
					actions={
						domain?.is_domain_only_site ? (
							<Button
								__next40pxDefaultSize
								variant="primary"
								href={ getCreateSiteFromDomainOnlyUrl( domain ) }
							>
								{ __( 'Add a new site' ) }
							</Button>
						) : undefined
					}
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 10 }>
						<SelectSite
							attachedSiteId={ domain?.blog_id }
							onSiteSelect={ ( site ) => {
								setSelectedSite( site );
								setIsConfirmDialogOpen( true );
							} }
						/>
					</VStack>
				</CardBody>
			</Card>
			{ !! selectedSite && isConfirmDialogOpen && (
				<Modal
					size="medium"
					__experimentalHideHeader
					onRequestClose={ () => ! isTransferringDomain && setIsConfirmDialogOpen( false ) }
				>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ sprintf(
								// translators: %1$s is the domain name, %2$s is the site name
								__( 'Do you want to attach %1$s to site %2$s?' ),
								domainName,
								selectedSite.name
							) }
						</Text>
						{ selectedSite?.plan?.is_free && (
							<Text as="p">
								{ __(
									'The target site doesn’t have a paid plan, so you won’t be able to set this domain as primary on the site.'
								) }
							</Text>
						) }
						<ButtonStack justify="flex-end">
							<Button
								__next40pxDefaultSize
								variant="tertiary"
								disabled={ isTransferringDomain }
								onClick={ () => setIsConfirmDialogOpen( false ) }
							>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								__next40pxDefaultSize
								variant="primary"
								isBusy={ isTransferringDomain }
								disabled={ isTransferringDomain }
								onClick={ onConfirmTransfer }
							>
								{ __( 'Confirm attachment' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }
		</PageLayout>
	);
}
