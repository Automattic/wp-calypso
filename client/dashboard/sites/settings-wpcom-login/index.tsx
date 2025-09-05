import { HostingFeatures, JetpackModules } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteJetpackConnectionQuery,
	siteJetpackModulesQuery,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
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
import SsoForm from './sso-form';

export default function WpcomLoginSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: jetpackModules } = useQuery( {
		...siteJetpackModulesQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );
	const { data: jetpackConnection } = useQuery( {
		...siteJetpackConnectionQuery( site.ID ),
		enabled: ! isSimple( site ),
	} );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		throw notFound();
	}

	const ssoAvailable = isJetpackModuleAvailable(
		jetpackModules,
		jetpackConnection,
		JetpackModules.SSO
	);

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'WordPress.com login' ) }
					description={ createInterpolateElement(
						__(
							'Allow registered users to log in to your site with their WordPress.com accounts. <link>Learn more</link>'
						),
						{
							link: <InlineSupportLink supportContext="security-wpcom-login" />,
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
				{ ! ssoAvailable && (
					<Notice>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'The WordPress.com login feature is disabled because your site is in offline mode. <link>Learn more</link>'
								),
								{
									// @ts-ignore - ExternalLink's children is not missing but is provided by the createInterpolateElement above.
									link: <ExternalLink href="https://jetpack.com/support/offline-mode/" />,
								}
							) }
						</Text>
					</Notice>
				) }
				{ ssoAvailable && <SsoForm jetpackModules={ jetpackModules } site={ site } /> }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
