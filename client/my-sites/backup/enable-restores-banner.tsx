/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const EnableRestoresBanner: FunctionComponent = () => {
	const translate = useTranslate();

	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) ) || '';

	return (
		<Banner
			className="backup__restore-banner"
			callToAction={ translate( 'Enable restores' ) as string }
			title={ translate( 'Set up your server credentials to get back online quickly' ) as string }
			description={ translate(
				'Add SSH, SFTP or FTP credentials to enable one click site restores.'
			) }
			href={
				isJetpackCloud() ? `/settings/${ siteSlug }` : `/settings/jetpack/${ siteSlug }#credentials`
			}
			icon="cloud-upload"
			event="calypso_backup_enable_restores_banner"
			tracksImpressionName="calypso_backup_enable_restores_banner_view"
			tracksClickName="calypso_backup_enable_restores_banner_click"
		/>
	);
};

export default EnableRestoresBanner;
