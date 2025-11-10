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
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { isJetpackModuleAvailable } from '../../utils/site-jetpack-modules';
import { isSimple } from '../../utils/site-types';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
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

	const ssoAvailable = isJetpackModuleAvailable(
		jetpackModules,
		jetpackConnection,
		JetpackModules.SSO
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'WordPress.com login' ) }
					description={ createInterpolateElement(
						__(
							'Allow registered users to log in to your site with their WordPress.com accounts. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="security-wpcom-login" />,
						}
					) }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SECURITY_SETTINGS }
				upsellId="site-settings-wpcom-login"
			>
				{ ! ssoAvailable && (
					<Notice>
						<Text as="p">
							{ createInterpolateElement(
								__(
									'The WordPress.com login feature is disabled because your site is in offline mode. <link>Learn more</link>'
								),
								{
									link: (
										<ExternalLink
											href="https://jetpack.com/support/offline-mode/"
											children={ null }
										/>
									),
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
