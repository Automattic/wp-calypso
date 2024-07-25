import { JetpackLogo } from '@automattic/components';
import { code, login, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import HostingOverviewFeatures from '../../../common/hosting-overview-features';
import HostingSection from '../../../common/hosting-section';
import { BackgroundType1 } from '../../../common/hosting-section/backgrounds';

export default function StandardAgencyHosting() {
	const translate = useTranslate();

	return (
		<div>
			{ /* Sample Hosting Section */ }
			<HostingSection
				icon={ <JetpackLogo size={ 12 } /> }
				heading="Optional Jetpack Security included"
				subheading="Supercharge your clients’ sites"
				description="Every Pressable hosting plan comes with a Jetpack Security License for free – a $239/year/site value."
				background={ BackgroundType1 }
			>
				<HostingOverviewFeatures
					items={ [
						{
							icon: code,
							title: translate( 'WPI-CLI' ),
							description: translate(
								`Run WP-CLI commands to manage users, plugins, themes, site settings, and more.`
							),
						},
						{
							icon: login,
							title: translate( 'SSH/SFTP' ),
							description: translate(
								'Effortlessly transfer files to and from your site using SFTP and SSH on WordPress.com.'
							),
						},
						{
							icon: reusableBlock,
							title: translate( 'Staging sites' ),
							description: translate(
								`Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.`
							),
						},
					] }
				/>
			</HostingSection>
		</div>
	);
}
