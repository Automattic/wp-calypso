import { WordPressLogo } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { Banner } from 'calypso/components/banner';
import { addQueryArgs } from 'calypso/lib/url';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

type Props = {
	site: SiteDetails;
	isUnlaunchedSite: boolean;
	urlRef: string;
};

export function DIFMUpsell( { site, isUnlaunchedSite, urlRef }: Props ) {
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
	const url = addQueryArgs(
		{
			ref: urlRef,
		},
		'https://wordpress.com/website-design-service/'
	);
	return (
		<Banner
			className="site-settings__built-by-upsell settings-site__built-by-upsell"
			title={ __( 'We’ll build your site for you' ) }
			description={ __(
				'Leave the heavy lifting to us and let our professional builders craft your compelling website.'
			) }
			callToAction={ __( 'Get started' ) }
			href={ url }
			target="_blank"
			icon={ <WordPressLogo size={ 32 } /> }
			disableCircle
			event="settings_bb_upsell"
			tracksImpressionName="calypso_settings_bb_upsell_impression"
			tracksClickName="calypso_settings_bb_upsell_cta_click"
		/>
	);
}
