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
					steps={ [
						__( 'In Google Workspace, choose to verify your domain with a TXT record.' ),
						__( 'Copy the value it shows. It starts with google-site-verification=.' ),
						createInterpolateElement(
							__( 'Paste it below and we add the records for you. <learnMoreLink />' ),
							{
								learnMoreLink: <InlineSupportLink supportContext="domain-email-google" />,
							}
						),
					] }
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
					steps={ [
						__( 'In iCloud Mail, start the custom domain setup.' ),
						__( 'Copy the verification value it shows. It starts with apple-domain=.' ),
						__( 'Paste it below and we add the records for you.' ),
					] }
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
					steps={ [
						__( 'In the Microsoft 365 admin center, add your domain.' ),
						__( 'Copy the TXT value it gives you. It starts with MS=ms.' ),
						createInterpolateElement(
							__( 'Paste it below and we add the records for you. <learnMoreLink />' ),
							{
								learnMoreLink: <InlineSupportLink supportContext="domain-email-o365" />,
							}
						),
					] }
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
					steps={ [
						__( 'In Zoho Mail, choose the TXT method at the domain verification step.' ),
						__( 'Copy the value it shows. It starts with zb.' ),
						createInterpolateElement(
							__( 'Paste it below and we add the records for you. <learnMoreLink />' ),
							{
								learnMoreLink: <InlineSupportLink supportContext="domain-email-zoho" />,
							}
						),
					] }
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
