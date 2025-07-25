import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { siteBySlugQuery } from '../../app/queries/site';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import SettingsPageHeader from '../settings-page-header';
import ProtectForm from './protect-form';

export default function WebApplicationFirewallSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		return null;
	}

	const canView = hasHostingFeature( site, HostingFeatures.SECURITY_SETTINGS );

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
			{ ! canView && (
				<Notice>
					<VStack>
						<Text as="p">{ __( 'No security configuration is required.' ) }</Text>
						<Text as="p">
							{ __( 'Security management is automatic for WordPress.com sites.' ) }
						</Text>
					</VStack>
				</Notice>
			) }

			{ /* JP WAF Module */ }

			{ canView && <ProtectForm siteSlug={ siteSlug } /> }

			{ /* JP WAF Module's Block List */ }

			{ /* Allow List */ }
		</PageLayout>
	);
}
