import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import versionCompare from 'calypso/lib/version-compare';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { StatsNoticeProps } from './types';

const JetpackVersionUpgradeNotice: React.FC< StatsNoticeProps > = ( {
	siteId,
	isOdysseyStats,
} ) => {
	const translate = useTranslate();
	const currentVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);
	const siteAdminUrl = useSelector( ( state ) => getSiteOption( state, siteId, 'admin_url' ) );

	// Only show for Odyssey stats
	if ( ! isOdysseyStats ) {
		return null;
	}

	// Get latest version from WP.org API or Calypso state
	const latestVersion = '12.9'; // This should be fetched from an API

	const needsUpgrade = currentVersion && versionCompare( currentVersion, latestVersion, '<' );

	if ( ! needsUpgrade ) {
		return null;
	}

	const updateUrl = `${ siteAdminUrl }update-core.php`;

	return (
		<Banner
			className="jetpack-version-upgrade-notice"
			title={ translate( 'Jetpack Update Available' ) }
			description={ translate(
				'Update Jetpack from version %(currentVersion)s to %(latestVersion)s to access the latest Stats features and improvements.',
				{
					args: {
						currentVersion: String( currentVersion ),
						latestVersion,
					},
				}
			) }
			callToAction={ translate( 'Update Now' ) }
			href={ updateUrl }
			icon="plugins"
			disableHref={ ! updateUrl }
			horizontal
			dismissPreferenceName="jetpack-version-upgrade-notice"
			tracksImpressionName="calypso_jetpack_version_upgrade_view"
			tracksClickName="calypso_jetpack_version_upgrade_click"
			tracksDismissName="calypso_jetpack_version_upgrade_dismiss"
		/>
	);
};

export default JetpackVersionUpgradeNotice;
