import { Button } from '@wordpress/components';
import { close, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ScheduleForm } from './schedule-form';
import type {
	MultiSitesResults,
	MultiSiteBaseParams,
} from 'calypso/blocks/plugins-scheduled-updates-multisite/types';

type Props = {
	onNavBack?: () => void;
};

export const ScheduleCreate = ( { onNavBack }: Props ) => {
	const translate = useTranslate();

	const onRecordSuccessEvent = ( sites: MultiSitesResults, params: MultiSiteBaseParams ) => {
		recordTracksEvent( 'calypso_scheduled_updates_multisite_create_schedule', {
			sites_count: sites.createdSiteSlugs.length,
			...params,
		} );

		// Add track event for each site
		sites.createdSiteSlugs.forEach( ( siteSlug ) => {
			recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
				site_slug: siteSlug,
				...params,
			} );
		} );
	};

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite plugins-update-manager-multisite-create">
			<div className="plugins-update-manager-multisite__header no-border">
				<h1 className="wp-brand-font">{ translate( 'New schedule' ) }</h1>
				<Button onClick={ onNavBack }>
					<Icon icon={ close } />
				</Button>
			</div>
			<ScheduleForm onNavBack={ onNavBack } onRecordSuccessEvent={ onRecordSuccessEvent } />
		</div>
	);
};
