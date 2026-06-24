import { legacyContactsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import './style.scss';

export default function SecurityLegacyContactPrint() {
	const { data: [ contact ] = [] } = useSuspenseQuery( legacyContactsQuery() );

	const handlePrint = () => {
		window.print();
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 3 } /> } title={ __( 'Legacy contact' ) } />
			}
		>
			<Card>
				<CardBody>
					{ /* TODO: translate these strings once the legacy contact UI is finalized. */ }
					{ contact ? (
						<VStack spacing={ 6 }>
							<VStack spacing={ 2 }>
								<Text>
									Keep this information somewhere safe. After your death, your legacy contact can
									give this key to WordPress.com to request access to your account.
								</Text>
							</VStack>

							<VStack spacing={ 1 } alignment="flex-start">
								<Text upperCase variant="muted" size={ 11 }>
									Legacy contact email
								</Text>
								<Text size={ 15 }>{ contact.email }</Text>
							</VStack>

							<VStack spacing={ 1 } alignment="flex-start">
								<Text upperCase variant="muted" size={ 11 }>
									Access key
								</Text>
								<div className="legacy-contact-print__key">{ contact.token }</div>
							</VStack>

							<ButtonStack justify="flex-start" className="legacy-contact-print__actions">
								<Button variant="primary" onClick={ handlePrint }>
									Print
								</Button>
							</ButtonStack>
						</VStack>
					) : (
						<VStack spacing={ 4 } alignment="flex-start">
							<Text>You don’t have a legacy contact set up yet.</Text>
							<ButtonStack justify="flex-start">
								<RouterLinkButton variant="primary" to="/me/security/legacy-contact">
									Back to legacy contact
								</RouterLinkButton>
							</ButtonStack>
						</VStack>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
