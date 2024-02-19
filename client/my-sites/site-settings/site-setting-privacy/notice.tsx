import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FEATURE_STYLE_CUSTOMIZATION, PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { SiteDetails } from '@automattic/data-stores';

interface SiteSettingPrivacyNoticeProps {
	selectedSite: SiteDetails | null | undefined;
	siteSlug: string | null;
}

const SiteSettingPrivacyNotice = ( { selectedSite, siteSlug }: SiteSettingPrivacyNoticeProps ) => {
	const translate = useTranslate();
	const upgradeUrl = `/plans/${ siteSlug }?plan=${ PLAN_PREMIUM }&feature=${ FEATURE_STYLE_CUSTOMIZATION }`;

	return (
		<>
			<div className="site-settings__advanced-customization-notice">
				<div className="site-settings__advanced-customization-notice-cta">
					<Gridicon icon="info-outline" />
					<span>
						{ translate(
							'Your site contains premium styles that will only be visible once you upgrade to a %(planName)s plan.',
							{
								args: {
									planName: getPlan( PLAN_PREMIUM )?.getTitle() ?? '',
								},
							}
						) }
					</span>
				</div>
				<div className="site-settings__advanced-customization-notice-buttons">
					{ selectedSite && (
						<Button href={ selectedSite.URL } target="_blank">
							{ translate( 'View site' ) }
						</Button>
					) }
					<Button
						className="is-primary"
						href={ upgradeUrl }
						onClick={ () => {
							recordTracksEvent( 'calypso_global_styles_gating_settings_notice_upgrade_click', {
								cta_name: 'settings_site_privacy',
							} );
						} }
					>
						{ translate( 'Upgrade' ) }
					</Button>
				</div>
			</div>
		</>
	);
};

export default SiteSettingPrivacyNotice;
