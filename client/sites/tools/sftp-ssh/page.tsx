import { FEATURE_SFTP, getPlanBusinessTitle } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import HostingActivation from 'calypso/sites/hosting-features/components/hosting-activation';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	useAreAdvancedHostingFeaturesSupported,
	useAreAdvancedHostingFeaturesSupportedAfterActivation,
} from '../../hosting-features/features';
import useSftpSshSettingTitle from './hooks/use-sftp-ssh-setting-title';
import { SftpCardLoadingPlaceholder } from './sftp-card-loading-placeholder';
import { SftpForm } from './sftp-form';

function Container( { isLoading, children }: { isLoading: boolean; children: React.ReactNode } ) {
	return isLoading ? <SftpCardLoadingPlaceholder /> : children;
}

function Description( { children }: { children?: React.ReactNode } ) {
	const title = useSftpSshSettingTitle();
	return <NavigationHeader title={ title } subtitle={ children } />;
}

export default function SftpSsh() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	const isSupportedAfterActivation = useAreAdvancedHostingFeaturesSupportedAfterActivation();

	const siteId = useSelector( getSelectedSiteId );

	const renderSetting = () => {
		if ( isSupported ) {
			return <SftpForm ContainerComponent={ Container } DescriptionComponent={ Description } />;
		}

		if ( isSupported === null ) {
			return null;
		}

		const redirectUrl = `/sites/tools/sftp-ssh/${ siteId }`;

		if ( isSupportedAfterActivation ) {
			return <HostingActivation redirectUrl={ redirectUrl } />;
		}

		const href = addQueryArgs( `/checkout/${ siteId }/business`, {
			redirect_to: redirectUrl,
		} );

		const upsell = (
			<UpsellNudge
				title={ translate(
					'Upgrade to the %(businessPlanName)s plan to get access to this feature.',
					{
						args: { businessPlanName: getPlanBusinessTitle() },
					}
				) }
				tracksImpressionName="calypso_tools_sftp_ssh_upgrade_impression"
				event="calypso_tools_sftp_ssh_upgrade_upsell"
				tracksClickName="calypso_tools_sftp_ssh_upgrade_click"
				href={ href }
				callToAction={ translate( 'Upgrade' ) }
				feature={ FEATURE_SFTP }
				showIcon
			/>
		);

		return (
			<SftpForm
				ContainerComponent={ Container }
				DescriptionComponent={ Description }
				upsell={ upsell }
			/>
		);
	};

	return <Panel className="tools-sftp-ssh">{ renderSetting() }</Panel>;
}
