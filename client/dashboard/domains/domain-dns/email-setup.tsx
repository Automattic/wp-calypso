import { DnsTemplates } from '@automattic/api-core';
import { __experimentalVStack as VStack, TabPanel } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import EmailSetupForm from './email-setup-form';

export default function EmailSetup() {
	const isMobile = useViewportMatch( 'small' );
	const tabs = [
		{
			name: 'google-workspace',
			title: 'Google Workspace',
			content: (
				<EmailSetupForm
					label="Google Workspace"
					key="google-workspace"
					description={ createInterpolateElement(
						__(
							'Paste the verification token provided by Google Workspace for the TXT record. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="domain-email-google" />,
						}
					) }
					pattern={ /^google-site-verification=[A-Za-z0-9_-]{43}$/ }
					placeholder="google-site-verification=…"
					provider={ DnsTemplates.G_SUITE.PROVIDER }
					service={ DnsTemplates.G_SUITE.SERVICE }
				/>
			),
		},
		{
			name: 'icloud-mail',
			title: 'iCloud Mail',
			content: (
				<EmailSetupForm
					key="icloud-mail"
					description={ __(
						'Paste the verification token provided by iCloud Mail for the TXT record.'
					) }
					label="iCloud Mail"
					pattern={ /^apple-domain=[A-Za-z0-9]{16}$/ }
					placeholder="apple-domain=…"
					provider={ DnsTemplates.ICLOUD_MAIL.PROVIDER }
					service={ DnsTemplates.ICLOUD_MAIL.SERVICE }
				/>
			),
		},
		{
			name: 'office-365',
			title: 'Office 365',
			content: (
				<EmailSetupForm
					key="office-365"
					description={ createInterpolateElement(
						__(
							'Paste the verification token provided by Office 365 for the TXT record. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="domain-email-o365" />,
						}
					) }
					label="Office 365"
					transformVariables={ ( variables ) =>
						Object.assign( {}, variables, {
							mxdata: variables.domain.replaceAll( '.', '-' ) + '.mail.protection.outlook.com',
						} )
					}
					pattern={ /^MS=ms\d{8}$/ }
					placeholder="MS=ms…"
					provider={ DnsTemplates.MICROSOFT_OFFICE365.PROVIDER }
					service={ DnsTemplates.MICROSOFT_OFFICE365.SERVICE }
				/>
			),
		},
		{
			name: 'zoho-mail',
			title: 'Zoho Mail',
			content: (
				<EmailSetupForm
					key="zoho-mail"
					description={ createInterpolateElement(
						__(
							'Paste the verification token provided by Zoho Mail for the TXT record. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="domain-email-zoho" />,
						}
					) }
					label="Zoho Mail"
					pattern={ /^zb\w{1,100}$/ }
					placeholder="zb…"
					provider={ DnsTemplates.ZOHO_MAIL.PROVIDER }
					service={ DnsTemplates.ZOHO_MAIL.SERVICE }
				/>
			),
		},
	];

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 5 }>
					<SectionHeader
						title={ __( 'Email setup' ) }
						description={ __( 'Set up an existing email service for this domain.' ) }
						level={ 3 }
					/>
					<TabPanel tabs={ tabs } orientation={ isMobile ? 'horizontal' : 'vertical' }>
						{ ( tab ) => <p>{ tab.content }</p> }
					</TabPanel>
				</VStack>
			</CardBody>
		</Card>
	);
}
