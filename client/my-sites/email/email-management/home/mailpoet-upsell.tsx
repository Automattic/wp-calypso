import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import mailpoetSymbol from 'calypso/assets/images/email-providers/mailpoet-symbol.svg';
import Banner from 'calypso/components/banner';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { useSelector } from 'calypso/state';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export default function MailPoetUpsell() {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID ?? 0;

	const mailpoetPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSiteId, 'mailpoet' )
	);
	const canInstallPlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSiteId, WPCOM_FEATURES_INSTALL_PLUGINS )
	);

	return (
		<>
			<QueryJetpackPlugins siteIds={ [ selectedSiteId ] } />

			{ canInstallPlugins && ! mailpoetPlugin && (
				<Banner
					className="mailpoet-upsell"
					callToAction={ translate( 'Add Plugin' ) }
					description={ translate(
						'Collect subscribers, manage your lists and create automatic emails to grow your email marketing reach.'
					) }
					disableCircle
					dismissPreferenceName="email_management_mailpoet_upsell"
					event="calypso_email_management_mailpoet_upsell"
					horizontal
					href={ `/plugins/mailpoet/${ selectedSite?.slug }` }
					iconPath={ mailpoetSymbol }
					title={ translate( 'MailPoet – Send beautiful newsletters from WordPress' ) }
					tracksClickName="calypso_email_management_mailpoet_upsell_click"
					tracksDismissName="calypso_email_management_mailpoet_upsell_dismiss"
					tracksImpressionName="calypso_email_management_mailpoet_upsell_view"
				/>
			) }
		</>
	);
}
