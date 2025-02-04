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
import PhpMyAdminForm from './form';

function Container( { children }: { children: React.ReactNode } ) {
	return children;
}

function Description( { children }: { children?: React.ReactNode } ) {
	const translate = useTranslate();
	return <NavigationHeader title={ translate( 'Database' ) } subtitle={ children } />;
}

export default function Database() {
	const translate = useTranslate();

	const isSupported = useAreAdvancedHostingFeaturesSupported();
	const isSupportedAfterActivation = useAreAdvancedHostingFeaturesSupportedAfterActivation();

	const siteId = useSelector( getSelectedSiteId );

	const renderSetting = () => {
		if ( isSupported ) {
			return (
				<PhpMyAdminForm
					disabled={ false }
					ContainerComponent={ Container }
					DescriptionComponent={ Description }
				/>
			);
		}

		if ( isSupported === null ) {
			return null;
		}

		const redirectUrl = `/sites/tools/database/${ siteId }`;

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
				tracksImpressionName="calypso_tools_database_upgrade_impression"
				event="calypso_tools_database_upgrade_upsell"
				tracksClickName="calypso_tools_database_upgrade_click"
				href={ href }
				callToAction={ translate( 'Upgrade' ) }
				feature={ FEATURE_SFTP }
				showIcon
			/>
		);

		return (
			<PhpMyAdminForm
				disabled={ false }
				ContainerComponent={ Container }
				DescriptionComponent={ Description }
				upsell={ upsell }
			/>
		);
	};

	return <Panel className="tools-database phpmyadmin-card">{ renderSetting() }</Panel>;
}
