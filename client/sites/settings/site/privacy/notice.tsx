import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	FEATURE_STYLE_CUSTOMIZATION,
	PLAN_PREMIUM,
	getPlan,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { SOURCE_SETTINGS_ADMINISTRATION } from 'calypso/my-sites/site-settings/site-tools/utils';
import { useSelector } from 'calypso/state';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import type { SiteDetails } from '@automattic/data-stores';
import type { ReactNode } from 'react';

interface SiteSettingsAdvancedCustomizationNoticeProps {
	notice: ReactNode;
	actions: ReactNode;
}

const SiteSettingsAdvancedCustomizationNotice = ( {
	notice,
	actions,
}: SiteSettingsAdvancedCustomizationNoticeProps ) => {
	return (
		<div className="site-settings__advanced-customization-notice">
			<div className="site-settings__advanced-customization-notice-cta">
				<Gridicon icon="info-outline" />
				{ notice }
			</div>
			<div className="site-settings__advanced-customization-notice-buttons">{ actions }</div>
		</div>
	);
};

interface SiteSettingPrivacyPremiumStylesNoticeProps {
	selectedSite: SiteDetails | null | undefined;
	siteSlug: string | null;
}

export const SiteSettingPrivacyPremiumStylesNotice = ( {
	selectedSite,
	siteSlug,
}: SiteSettingPrivacyPremiumStylesNoticeProps ) => {
	const translate = useTranslate();
	// @TODO Cleanup once the test phase is over.
	const upgradeToPlan = useSiteGlobalStylesOnPersonal( selectedSite?.ID )
		? PLAN_PERSONAL
		: PLAN_PREMIUM;
	const upgradeUrl = `/plans/${ siteSlug }?plan=${ upgradeToPlan }&feature=${ FEATURE_STYLE_CUSTOMIZATION }`;

	return (
		<SiteSettingsAdvancedCustomizationNotice
			notice={
				<span>
					{ translate(
						'Your site contains premium styles that will only be visible once you upgrade to a %(planName)s plan.',
						{
							args: {
								planName: getPlan( upgradeToPlan )?.getTitle() ?? '',
							},
						}
					) }
				</span>
			}
			actions={
				<>
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
				</>
			}
		/>
	);
};

interface SiteSettingsPrivacyDiscourageSearchEnginesNoticeProps {
	selectedSite: SiteDetails | null | undefined;
	siteSlug: string | null;
}

export const SiteSettingsPrivacyDiscourageSearchEnginesNotice = ( {
	selectedSite,
	siteSlug,
}: SiteSettingsPrivacyDiscourageSearchEnginesNoticeProps ) => {
	const translate = useTranslate();
	const primaryDomain = useSelector( ( state ) =>
		getPrimaryDomainBySiteId( state, selectedSite?.ID ?? 0 )
	);
	const hasNonWpcomDomains =
		useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) || [] ).filter(
			( domain ) => ! domain.isWPCOMDomain
		).length > 0;

	return (
		<SiteSettingsAdvancedCustomizationNotice
			notice={
				<span>
					{ translate(
						"Your site's current primary domain is {{strong}}%(domain)s{{/strong}}. This domain is intended for temporary use and will not be indexed by search engines. To ensure your site can be indexed, please register or connect a custom primary domain.",
						{
							args: {
								domain: primaryDomain?.domain ?? '',
							},
							components: {
								strong: <strong style={ { overflowWrap: 'anywhere' } } />,
							},
						}
					) }
				</span>
			}
			actions={
				hasNonWpcomDomains ? (
					<Button
						className="is-primary"
						href={ addQueryArgs( `/domains/manage/${ siteSlug }`, {
							source: SOURCE_SETTINGS_ADMINISTRATION,
						} ) }
						onClick={ () =>
							recordTracksEvent( 'calypso_settings_site_privacy_manage_domains_button_click' )
						}
					>
						{ translate( 'Manage domains' ) }
					</Button>
				) : (
					<Button
						className="is-primary"
						href={ addQueryArgs( `/domains/add/${ siteSlug }`, {
							redirect_to: window.location.pathname,
						} ) }
						onClick={ () =>
							recordTracksEvent( 'calypso_settings_site_privacy_add_domain_button_click' )
						}
					>
						{ translate( 'Add new domain' ) }
					</Button>
				)
			}
		/>
	);
};
