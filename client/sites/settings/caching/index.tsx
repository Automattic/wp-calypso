import { WPCOM_FEATURES_ATOMIC, getPlanBusinessTitle } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import HostingActivation from 'calypso/sites/hosting-features/components/hosting-activation';
import {
	useAreHostingFeaturesSupported,
	useAreHostingFeaturesSupportedAfterActivation,
} from 'calypso/sites/hosting-features/features';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CachingForm from './form';

export default function CachingSettings() {
	const translate = useTranslate();
	const isSupported = useAreHostingFeaturesSupported();
	const isSupportedAfterActivation = useAreHostingFeaturesSupportedAfterActivation();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const renderSetting = () => {
		if ( isSupported ) {
			return <CachingForm />;
		}

		if ( isSupportedAfterActivation === null ) {
			return null;
		}

		const redirectUrl = `/sites/settings/caching/${ siteId }`;

		if ( isSupportedAfterActivation ) {
			return <HostingActivation redirectUrl={ redirectUrl } />;
		}

		const href = addQueryArgs( `/checkout/${ siteId }/business`, {
			redirect_to: redirectUrl,
		} );

		return (
			<UpsellNudge
				title={ translate(
					'Upgrade to the %(businessPlanName)s plan to get access to this feature and all {{a}}advanced tools{{/a}}.',
					{
						components: { a: <a href={ `/sites/tools/${ siteSlug }` } /> },
						args: { businessPlanName: getPlanBusinessTitle() },
					}
				) }
				tracksImpressionName="calypso_settings_caching_upgrade_impression"
				event="calypso_settings_caching_upgrade_upsell"
				tracksClickName="calypso_settings_caching_upgrade_click"
				href={ href }
				callToAction={ translate( 'Upgrade' ) }
				feature={ WPCOM_FEATURES_ATOMIC }
				showIcon
			/>
		);
	};

	return (
		<Panel className="tools-caching">
			<NavigationHeader
				title={ translate( 'Caching' ) }
				subtitle={ translate( 'Manage your site’s server-side caching. {{a}}Learn more{{/a}}', {
					components: {
						a: <InlineSupportLink supportContext="hosting-clear-cache" showIcon={ false } />,
					},
				} ) }
			/>
			{ renderSetting() }
		</Panel>
	);
}
