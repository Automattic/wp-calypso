import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_NO_WPCOM_BRANDING,
	getPlan,
} from '@automattic/calypso-products';
import { CompactCard, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { preventWidows } from 'calypso/lib/formatting';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getCustomizerUrl } from 'calypso/state/sites/selectors';
import { isHostingMenuUntangled } from '../../utils';

import './style.scss';

export default function FooterCredit( { site, siteIsJetpack } ) {
	const translate = useTranslate();
	const isWPForTeamsSite = useSelectedSiteSelector( isSiteWPForTeams );
	const siteIsAtomic = useSelectedSiteSelector( isSiteAutomatedTransfer );
	const hasNoWpcomBranding = useSelectedSiteSelector(
		siteHasFeature,
		WPCOM_FEATURES_NO_WPCOM_BRANDING
	);
	const customizerUrl = useSelectedSiteSelector( getCustomizerUrl, 'identity' );

	const { data: activeThemeData } = useActiveThemeQuery( site?.ID ?? -1, !! site );
	const hasBlockTheme = activeThemeData?.[ 0 ]?.is_block_theme ?? true;

	if ( isWPForTeamsSite || ( siteIsJetpack && ! siteIsAtomic ) || hasBlockTheme ) {
		return null;
	}

	const renderContent = () => {
		return (
			<>
				<p>
					{ preventWidows(
						translate(
							'You can customize your website by changing the footer credit in customizer.'
						),
						2
					) }
				</p>
				<div>
					<Button className="site-settings__footer-credit-change" href={ customizerUrl }>
						{ translate( 'Change footer credit' ) }
					</Button>
				</div>
			</>
		);
	};

	const renderUpsellNudge = () => {
		return (
			! hasNoWpcomBranding && (
				<UpsellNudge
					feature={ WPCOM_FEATURES_NO_WPCOM_BRANDING }
					plan={ PLAN_BUSINESS }
					title={ translate(
						'Remove the footer credit entirely with WordPress.com %(businessPlanName)s',

						{ args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() } }
					) }
					description={ translate(
						'Upgrade to remove the footer credit, use advanced SEO tools and more'
					) }
					showIcon
					event="settings_remove_footer"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksClickName="calypso_upgrade_nudge_cta_click"
				/>
			)
		);
	};

	return (
		<>
			{ ! isHostingMenuUntangled() ? (
				<div className="site-settings__footer-credit-container">
					<SettingsSectionHeader
						title={ translate( 'Footer credit' ) }
						id="site-settings__footer-credit-header"
					/>
					<CompactCard className="site-settings__footer-credit-explanation">
						{ renderContent() }
					</CompactCard>
					{ renderUpsellNudge() }
				</div>
			) : (
				<PanelCard className="settings-site__footer-credit">
					<PanelCardHeading>{ translate( 'Footer credit' ) }</PanelCardHeading>
					{ renderContent() }
					{ renderUpsellNudge() }
				</PanelCard>
			) }
		</>
	);
}
