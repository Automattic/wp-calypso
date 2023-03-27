import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';

export function notifications( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'notifications';

	trackPageLoad( basePath, 'Reader > Notifications', mcKey );
	recordTrack( 'calypso_reader_notifications_viewed' );

	context.primary = (
		<div className="reader-notifications__panel">
			<AsyncLoad
				require="calypso/notifications"
				isShowing={ true }
				checkToggle={ () => {} }
				setIndicator={ () => {} }
				placeholder={ null }
			/>
		</div>
	);
	next();
}
