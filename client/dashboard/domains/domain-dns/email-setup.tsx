import { Card, CardBody, TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
import { DnsTemplates } from '../../data/domain-dns-templates';
import EmailSetupForm from './email-setup-form';

import './email-setup.scss';

export default function EmailSetup() {
	const tabs = [
		{
			name: 'google-workspace',
			title: __( 'Google Workspace' ),
			content: (
				<div className="email-setup__tab-content">
					<EmailSetupForm
						label="Google Workspace"
						description={ __(
							'Paste the verification token provided by Google Workspace for the TXT record.'
						) }
						pattern={ /^google-site-verification=[A-Za-z0-9_-]{43}$/ }
						placeholder="e.g., google-site-verification=..."
						provider={ DnsTemplates.G_SUITE.PROVIDER }
						service={ DnsTemplates.G_SUITE.SERVICE }
						submitLabel={ __( 'Setup' ) }
					/>
				</div>
			),
		},
		{
			name: 'icloud-mail',
			title: __( 'iCloud Mail' ),
			content: (
				<div className="email-setup__tab-content">
					<EmailSetupForm
						description={ __(
							'Paste the verification token provided by iCloud Mail for the TXT record.'
						) }
						label="iCloud Mail"
						pattern={ /^apple-domain=[A-Za-z0-9]{16}$/ }
						placeholder="apple-domain=..."
						provider={ DnsTemplates.ICLOUD_MAIL.PROVIDER }
						service={ DnsTemplates.ICLOUD_MAIL.SERVICE }
						submitLabel={ __( 'Setup' ) }
					/>
				</div>
			),
		},
		{
			name: 'office-365',
			title: __( 'Office 365' ),
			content: (
				<div className="email-setup__tab-content">
					<EmailSetupForm
						description={ __(
							'Paste the verification token provided by Office 365 for the TXT record.'
						) }
						label="Office 365"
						modifyVariables={ ( variables ) =>
							Object.assign( {}, variables, {
								mxdata: variables.domain.replaceAll( '.', '-' ) + '.mail.protection.outlook.com',
							} )
						}
						pattern={ /^MS=ms\d{8}$/ }
						placeholder="MS=ms..."
						provider={ DnsTemplates.MICROSOFT_OFFICE365.PROVIDER }
						service={ DnsTemplates.MICROSOFT_OFFICE365.SERVICE }
						submitLabel={ __( 'Setup' ) }
					/>
				</div>
			),
		},
		{
			name: 'zoho-mail',
			title: __( 'Zoho Mail' ),
			content: (
				<div className="email-setup__tab-content">
					<EmailSetupForm
						description={ __(
							'Paste the verification token provided by Zoho Mail for the TXT record.'
						) }
						label="Zoho Mail"
						pattern={ /^zb\w{1,100}$/ }
						placeholder="zb..."
						provider={ DnsTemplates.ZOHO_MAIL.PROVIDER }
						service={ DnsTemplates.ZOHO_MAIL.SERVICE }
						submitLabel={ __( 'Setup' ) }
					/>
				</div>
			),
		},
	];

	return (
		<Card className="email-setup">
			<CardBody>
				<SectionHeader
					title={ __( 'Email setup' ) }
					description={ __( 'Set up an existing email service for this domain' ) }
					level={ 3 }
				/>
				<TabPanel tabs={ tabs } className="email-setup__tabs">
					{ ( tab ) => <div className="email-setup__tab-panel">{ tab.content }</div> }
				</TabPanel>
			</CardBody>
		</Card>
	);
}
