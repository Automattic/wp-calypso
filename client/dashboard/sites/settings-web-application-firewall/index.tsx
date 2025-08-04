import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { siteBySlugQuery } from '../../app/queries/site';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import { HostingFeatures } from '../../data/constants';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SettingsPageHeader from '../settings-page-header';
import AllowListForm from './allow-list-form';
import AutomaticRulesForm from './automatic-rules-form';
import BlockListForm from './block-list-form';
import ProtectForm from './protect-form';

export default function WebApplicationFirewallSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		throw notFound();
	}

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
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SECURITY_SETTINGS }
				tracksFeatureId="settings-security"
			>
				<AutomaticRulesForm site={ site } />

				<ProtectForm site={ site } />

				<BlockListForm site={ site } />

				<AllowListForm site={ site } />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
