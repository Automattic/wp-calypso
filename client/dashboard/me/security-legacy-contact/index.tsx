import { legacyContactsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { people } from '@wordpress/icons';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import LegacyContactForm from './legacy-contact-form';
import RemoveContactDialog from './remove-contact-dialog';

import './style.scss';

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
								<SectionHeader title={ __( 'Your legacy contact' ) } level={ 3 } />
								<HStack
									className="legacy-contact-card"
									spacing={ 3 }
									justify="flex-start"
									alignment="center"
									expanded={ false }
								>
									<div className="legacy-contact-card__avatar">
										<Icon icon={ people } size={ 28 } />
									</div>
									<VStack spacing={ 0 } alignment="flex-start">
										<Text upperCase variant="muted" size={ 11 }>
											{ __( 'Legacy contact email' ) }
										</Text>
										<Text size={ 15 }>{ contact.contact_email }</Text>
									</VStack>
								</HStack>
								<Text>
									{ __(
										'The printable copy contains the access key your legacy contact will need. We recommend printing it and storing it with your estate planning documents, or saving it securely in a password manager.'
									) }
								</Text>
								<Text>
									{ __(
										'Treat the access key like a password and only share it with your legacy contact when you’re ready. We won’t contact them or send them the key on your behalf.'
									) }
								</Text>
								<ButtonStack justify="flex-start">
									<RouterLinkButton variant="secondary" to="/me/security/legacy-contact/print">
										{ __( 'View printable copy' ) }
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
