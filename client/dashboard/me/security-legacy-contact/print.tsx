import { legacyContactQuery, legacyContactsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import './style.scss';

function LegacyContactDetails( { legacyContactId }: { legacyContactId: number } ) {
	// The access key is only returned by the single-contact endpoint, so fetch
	// the full contact here rather than relying on the listing response.
	const { data: contact } = useSuspenseQuery( legacyContactQuery( legacyContactId ) );

	const handlePrint = () => {
		window.print();
	};

	return (
		<VStack spacing={ 6 }>
			<SectionHeader title={ __( 'Your legacy contact' ) } level={ 3 } />
			<Text as="p" size={ 15 } lineHeight={ 1.5 }>
				{ __(
					'Keep this information somewhere safe. After your death, your legacy contact can give this key to WordPress.com to request access to your account.'
				) }
			</Text>

			<dl className="legacy-contact-print__fields">
				<VStack spacing={ 1 } alignment="flex-start">
					<Text as="dt" upperCase variant="muted" size={ 11 }>
						{ __( 'Legacy contact email' ) }
					</Text>
					<Text as="dd" size={ 15 }>
						{ contact.contact_email }
					</Text>
				</VStack>

				<VStack spacing={ 1 } alignment="flex-start">
					<Text as="dt" upperCase variant="muted" size={ 11 }>
						{ __( 'Access key' ) }
					</Text>
					<dd className="legacy-contact-print__key">{ contact.access_key }</dd>
				</VStack>
			</dl>

			<VStack spacing={ 1 } alignment="flex-start">
				<Text
					as="h4"
					upperCase
					variant="muted"
					size={ 11 }
					className="legacy-contact-print__heading"
				>
					{ __( 'How to claim access' ) }
				</Text>
				<Text as="p" size={ 15 } lineHeight={ 1.5 }>
					{ createInterpolateElement(
						__(
							'To request access, your legacy contact should visit <link>wordpress.com/digital-legacy</link> and follow the instructions there. They’ll need the access key above.'
						),
						{
							link: <a href="https://wordpress.com/digital-legacy" />,
						}
					) }
				</Text>
			</VStack>

			<ButtonStack justify="flex-start" className="legacy-contact-print__actions">
				<Button variant="primary" onClick={ handlePrint }>
					{ __( 'Print' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}

export default function SecurityLegacyContactPrint() {
	const { data: [ contact ] = [] } = useSuspenseQuery( legacyContactsQuery() );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 3 } /> } title={ __( 'Legacy contact' ) } />
			}
		>
			<Card>
				<CardBody>
					{ contact ? (
						<LegacyContactDetails legacyContactId={ contact.legacy_contact_id } />
					) : (
						<VStack spacing={ 4 } alignment="flex-start">
							<Text>{ __( 'You don’t have a legacy contact set up yet.' ) }</Text>
							<ButtonStack justify="flex-start">
								<RouterLinkButton variant="primary" to="/me/security/legacy-contact">
									{ __( 'Back to legacy contact' ) }
								</RouterLinkButton>
							</ButtonStack>
						</VStack>
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
