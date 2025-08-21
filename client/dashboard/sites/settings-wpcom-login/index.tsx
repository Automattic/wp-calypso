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
import SsoForm from './sso-form';

export default function WpcomLoginSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! isEnabled( 'dashboard/v2/security-settings' ) ) {
		throw notFound();
	}

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
				<SsoForm site={ site } />
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
