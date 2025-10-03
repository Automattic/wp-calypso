import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteJetpackConnectionQuery,
	siteJetpackModulesQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalText as Text, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import PageLayout from '../../components/page-layout';
import { isJetpackModuleAvailable } from '../../utils/site-jetpack-modules';
import { isSimple } from '../../utils/site-types';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import SettingsPageHeader from '../settings-page-header';
import AllowListForm from './allow-list-form';
import AutomaticRulesForm from './automatic-rules-form';
import BlockListForm from './block-list-form';
import ProtectForm from './protect-form';

export default function WebApplicationFirewallSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: jetpackModules } = useQuery( {
		...siteJetpackModulesQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );
	const { data: jetpackConnection } = useQuery( {
		...siteJetpackConnectionQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );

	const modulesAvailable =
		isJetpackModuleAvailable( jetpackModules, jetpackConnection, JetpackModules.WAF ) &&
		isJetpackModuleAvailable( jetpackModules, jetpackConnection, JetpackModules.PROTECT );

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
				{ ! modulesAvailable && (
					<Notice>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'The web application firewall (WAF) is disabled because your site is in offline mode. <link>Learn more</link>'
								),
								{
									// @ts-ignore - ExternalLink's children is not missing but it's provided by the createInterpolateElement above.
									link: <ExternalLink href="https://jetpack.com/support/offline-mode/" />,
								}
							) }
						</Text>
					</Notice>
				) }

				{ modulesAvailable && (
					<>
						<AutomaticRulesForm site={ site } />

						<ProtectForm jetpackModules={ jetpackModules } site={ site } />

						<BlockListForm site={ site } />

						<AllowListForm site={ site } />
					</>
				) }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
