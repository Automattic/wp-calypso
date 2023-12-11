import { SiteDetails } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
import builtByLogo from 'calypso/assets/images/illustrations/built-by-wp-vert-blue.png';
import { Banner } from 'calypso/components/banner';

type Props = {
	site: SiteDetails;
	isUnlaunchedSite: boolean;
};

export function BuiltByUpsell( { site, isUnlaunchedSite }: Props ) {
	const { __ } = useI18n();
	// Do not show for launched sites
	if ( ! isUnlaunchedSite ) {
		return null;
	}

	// Do not show if we don't know when the site was created
	if ( ! site?.options?.created_at ) {
		return null;
	}

	// Do not show if the site is less than 4 days old
	const siteCreatedAt = Date.parse( site?.options?.created_at );
	const FOUR_DAYS_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000;
	if ( Date.now() - siteCreatedAt < FOUR_DAYS_IN_MILLISECONDS ) {
		return null;
	}

	return (
		<Banner
			className="site-settings__built-by-upsell"
			title={ __( 'We’ll build your site for you' ) }
			description={ __(
				'Leave the heavy lifting to us and let our professional builders craft your compelling website.'
			) }
			callToAction={ __( 'Get started' ) }
			href="https://wordpress.com/website-design-service/?ref=unlaunched-settings"
			target="_blank"
			iconPath={ builtByLogo }
			disableCircle={ true }
			event="settings_bb_upsell"
			tracksImpressionName="calypso_settings_bb_upsell_impression"
			tracksClickName="calypso_settings_bb_upsell_cta_click"
		/>
	);
}
