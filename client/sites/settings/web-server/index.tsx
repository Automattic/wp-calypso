import { FEATURE_SFTP, getPlanBusinessTitle } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import HostingActivation from 'calypso/sites/hosting-features/components/hosting-activation';
import { useSelector } from 'calypso/state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	useAreAdvancedHostingFeaturesSupported,
	useAreAdvancedHostingFeaturesSupportedAfterActivation,
} from '../../hosting-features/features';
import DefensiveModeForm from './defensive-mode-form';
import ServerConfigurationForm from './server-configuration-form';

import './style.scss';

export default function WebServerSettings() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	const isSupportedAfterActivation = useAreAdvancedHostingFeaturesSupportedAfterActivation();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isSiteAtomic = useSelectedSiteSelector( isAtomicSite );

	const renderSetting = () => {
		if ( isSupported ) {
			return (
				<>
					<ServerConfigurationForm />
					<DefensiveModeForm />
				</>
			);
		}

		if ( isSupported === null ) {
			return null;
		}

		const redirectUrl = `/sites/settings/web-server/${ siteId }`;

		if ( isSupportedAfterActivation ) {
			return <HostingActivation redirectUrl={ redirectUrl } />;
		}

		const href = addQueryArgs( `/checkout/${ siteId }/business`, {
			redirect_to: redirectUrl,
		} );

		return (
			<UpsellNudge
				title={
					isSiteAtomic
						? translate(
								'Upgrade to the %(businessPlanName)s plan to get access to this feature.',
								{
									args: { businessPlanName: getPlanBusinessTitle() },
								}
						  )
						: translate(
								'Upgrade to the %(businessPlanName)s plan to get access to this feature and all {{a}}advanced tools{{/a}}.',
								{
									components: { a: <a href={ `/sites/tools/${ siteSlug }` } /> },
									args: { businessPlanName: getPlanBusinessTitle() },
								}
						  )
				}
				tracksImpressionName="calypso_settings_web_server_upgrade_impression"
				event="calypso_settings_web_server_upgrade_upsell"
				tracksClickName="calypso_settings_web_server_upgrade_click"
				href={ href }
				callToAction={ translate( 'Upgrade' ) }
				feature={ FEATURE_SFTP }
				showIcon
			/>
		);
	};

	return (
		<Panel className="settings-web-server">
			<NavigationHeader
				title={ translate( 'Web server' ) }
				subtitle={ translate(
					'For sites with specialized needs, fine-tune how the web server runs your website.'
				) }
			/>
			{ renderSetting() }
		</Panel>
	);
}
