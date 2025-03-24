import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad } from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import { getShouldShowGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getIsNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import { toggleNotificationsPanel } from 'calypso/state/ui/actions';

export function notifications( context, next ) {
	const basePath = sectionify( context.path );
	const mcKey = 'notifications';
	const state = context.store.getState();
	const shouldShowGlobalSidebar = getShouldShowGlobalSidebar( state, null, 'reader' );
	const isGlobalNotificationsOpen = getIsNotificationsOpen( state );

	// Close the global notifications panel if it's already open.
	if ( isGlobalNotificationsOpen ) {
		context.store.dispatch( toggleNotificationsPanel() );
	}

	trackPageLoad( basePath, 'Reader > Notifications', mcKey );
	recordTrack(
		'calypso_reader_notifications_viewed',
		{},
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	const NotificationTitle = () => {
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
			<div className="reader-notifications__page">
				<div className="reader-notifications__page-notice">
					<p>
						{ translate(
							"Didn't expect to see this page? {{learnMoreLink}}Learn about 3rd party cookies.{{/learnMoreLink}}",
							{
								components: {
									learnMoreLink: <a href="/notifications" />,
								},
							}
						) }
					</p>
				</div>
				<div className="reader-notifications__page-panel">
					<AsyncLoad
						require="calypso/notifications"
						isShowing
						checkToggle={ () => {} }
						placeholder={ null }
						isGlobalSidebarVisible={ shouldShowGlobalSidebar }
					/>
				</div>
			</div>
		</>
	);
	next();
}
