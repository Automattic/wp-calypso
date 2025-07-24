import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import ProtectForm from './protect-form';

export default function WebApplicationFirewallSettings( { siteSlug }: { siteSlug: string } ) {
	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Web Application Firewall (WAF)' ) }
					description={ createInterpolateElement(
						__(
							'Our web application firewall (WAF) examines incoming traffic to your website and decides to allow or block it based on various rules. <link>Learn more</link>'
						),
						{
							link: <InlineSupportLink supportContext="security-web-application-firewall" />,
						}
					) }
				/>
			}
		>
			{ /* JP WAF Module */ }

			<ProtectForm siteSlug={ siteSlug } />

			{ /* JP WAF Module's Block List */ }

			{ /* Allow List */ }
		</PageLayout>
	);
}
