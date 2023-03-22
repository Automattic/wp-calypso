import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad, trackScrollPage } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';

export function notifications( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'notifications';
	const title = 'Reader > Notifications';

	trackPageLoad( basePath, 'Reader > Notifications', mcKey );
	recordTrack( 'calypso_reader_notifications_viewed' );

	const streamKey = 'notifications';
	const scrollTracker = trackScrollPage.bind( null, '/read/notifications', title, 'Reader', mcKey );

	context.primary = (
		<AsyncLoad
			require="calypso/apps/notifications/src/panel/Notifications"
			key="notifications"
			title="Notifications"
			streamKey={ streamKey }
			trackScrollPage={ scrollTracker }
		/>
	);
	next();
}
