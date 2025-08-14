import { Card, CardBody, TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { SectionHeader } from '../../components/section-header';
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
						placeholder="e.g., google-site-verification=..."
						description={ __(
							'Paste the verification token provided by Google Workspace for the TXT record.'
						) }
						submitLabel={ __( 'Setup' ) }
						pattern={ /^google-site-verification=[A-Za-z0-9_-]{43}$/ }
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
						label="iCloud Mail"
						placeholder="apple-domain=..."
						description={ __(
							'Paste the verification token provided by iCloud Mail for the TXT record.'
						) }
						submitLabel={ __( 'Setup' ) }
						pattern={ /^apple-domain=[A-Za-z0-9]{16}$/ }
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
						label="Office 365"
						placeholder="MS=ms..."
						description={ __(
							'Paste the verification token provided by Office 365 for the TXT record.'
						) }
						submitLabel={ __( 'Setup' ) }
						pattern={ /^MS=ms\d{8}$/ }
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
						label="Zoho Mail"
						placeholder="zb..."
						description={ __(
							'Paste the verification token provided by Zoho Mail for the TXT record.'
						) }
						submitLabel={ __( 'Setup' ) }
						pattern={ /^zb\w{1,100}$/ }
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
