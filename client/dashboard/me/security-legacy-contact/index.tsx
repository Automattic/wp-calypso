import { legacyContactsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

export default function SecurityLegacyContact() {
	const { data: [ contact ] = [] } = useSuspenseQuery( legacyContactsQuery() );

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
							<Text>
								{ /* TODO: translate this string once the legacy contact UI is finalized. */ }
								{ createInterpolateElement( 'Your legacy contact is <contactEmail />.', {
									contactEmail: <strong>{ contact.email }</strong>,
								} ) }
							</Text>
						) : (
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									onClick={ () => {
										// TODO: open the legacy contact setup flow.
									} }
								>
									{ __( 'Set up legacy contact' ) }
								</Button>
							</ButtonStack>
						) }
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
