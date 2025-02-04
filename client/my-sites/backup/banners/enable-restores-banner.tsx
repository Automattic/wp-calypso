import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import jetpackCredentials from 'calypso/assets/images/jetpack/jetpack-icon-key.svg';
import Banner from 'calypso/components/banner';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import '../style.scss';

const EnableRestoresBanner: FunctionComponent = () => {
	const translate = useTranslate();

	const siteSlug = useSelector( getSelectedSiteSlug ) || '';

	return (
		<Banner
			className="backup__restore-banner"
			callToAction={ translate( 'Enable restores' ) as string }
			title={ translate( 'Add your server credentials' ) as string }
			description={ translate(
				'Enter your SSH, SFTP or FTP credentials to enable one-click site restores and faster backups.'
			) }
			href={
				isJetpackCloud() || isA8CForAgencies()
					? `/settings/${ siteSlug }`
					: `/settings/jetpack/${ siteSlug }#credentials`
			}
			iconPath={ jetpackCredentials }
			event="calypso_backup_enable_restores_banner"
			tracksImpressionName="calypso_backup_enable_restores_banner_view"
			tracksClickName="calypso_backup_enable_restores_banner_click"
		/>
	);
};

export default EnableRestoresBanner;
