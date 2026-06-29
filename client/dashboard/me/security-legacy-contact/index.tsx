import { legacyContactsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import LegacyContactForm from './legacy-contact-form';
import RemoveContactDialog from './remove-contact-dialog';

export default function SecurityLegacyContact() {
	const { data: [ contact ] = [] } = useSuspenseQuery( legacyContactsQuery() );
	const [ isRemoveDialogOpen, setIsRemoveDialogOpen ] = useState( false );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Legacy contact' ) }
					description={ __(
						'A legacy contact is someone you trust to have access to your account after your death.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ contact ? (
							<>
								<Text>
									{ /* TODO: translate this string once the legacy contact UI is finalized. */ }
									{ createInterpolateElement( 'Your legacy contact is <contactEmail />.', {
										contactEmail: <strong>{ contact.contact_email }</strong>,
									} ) }
								</Text>
								<ButtonStack justify="flex-start">
									<RouterLinkButton variant="secondary" to="/me/security/legacy-contact/print">
										{ /* TODO: translate this string once the legacy contact UI is finalized. */ }
										View printable details
									</RouterLinkButton>
									<Button
										variant="secondary"
										isDestructive
										onClick={ () => setIsRemoveDialogOpen( true ) }
									>
										{ __( 'Remove legacy contact' ) }
									</Button>
								</ButtonStack>
								<RemoveContactDialog
									contact={ contact }
									isOpen={ isRemoveDialogOpen }
									onClose={ () => setIsRemoveDialogOpen( false ) }
								/>
							</>
						) : (
							<LegacyContactForm />
						) }
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
