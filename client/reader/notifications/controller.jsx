import { useTranslate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';

export function notifications( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'notifications';

	trackPageLoad( basePath, 'Reader > Notifications', mcKey );
	recordTrack( 'calypso_reader_notifications_viewed' );

	const NotificationTitle = () => {
		const translate = useTranslate();
		return (
			<DocumentHead
				title={ translate( '%s ‹ Reader', {
					args: 'Notifications',
					comment: '%s is the section name. For example: "My Likes"',
					textOnly: true,
				} ) }
			/>
		);
	};

	context.primary = (
		<>
			<NotificationTitle />
			<div className="reader-notifications__panel">
				<AsyncLoad
					require="calypso/notifications"
					isShowing={ true }
					checkToggle={ () => {} }
					setIndicator={ () => {} }
					placeholder={ null }
				/>
			</div>
		</>
	);
	next();
}
