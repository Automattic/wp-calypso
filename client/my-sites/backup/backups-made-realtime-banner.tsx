import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const BackupsMadeRealtimeBanner: FunctionComponent = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );

	return (
		<Banner
			callToAction={ translate( 'Learn more' ) }
			className="backups-made-realtime-banner"
			description={ translate(
				'Your site is backed up as you make edits, and automatically once a day.'
			) }
			event="calypso_backups_made_realtime_banner"
			dismissPreferenceName={ `backups-made-realtime-${ siteId }` }
			href="https://jetpack.com/blog/real-time-backups-become-a-reality-with-jetpack/"
			target="_blank"
			icon="history"
			title={ translate( 'Every change you make will be backed up' ) }
			tracksClickName="calypso_backups_made_realtime_banner_click"
			tracksDismissName="calypso_backups_made_realtime_banner_dismiss"
			tracksImpressionName="calypso_backups_made_realtime_banner_view"
			horizontal
			disableCircle
		/>
	);
};

export default BackupsMadeRealtimeBanner;
