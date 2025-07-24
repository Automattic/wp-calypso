import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';

export default function WebApplicationFirewallSettings( { siteSlug }: { siteSlug: string } ) {
	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Web Application Firewall (WAF)' ) }
					description={ __(
						'Our web application firewall (WAF) examines incoming traffic to your website and decides to allow or block it based on various rules.'
					) }
				/>
			}
		>
			{ siteSlug }
		</PageLayout>
	);
}
