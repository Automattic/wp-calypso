/**
 * Loads the notifications client into Calypso and
 * connects the messaging and interactive elements
 *
 *  - messages through iframe
 *  - keyboard hotkeys
 *  - window/pane scrolling
 *  - service worker
 * @module notifications
 */

import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { Dropdown } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { Component, Suspense, lazy, useMemo } from 'react';
import { connect } from 'react-redux';
import localStorageHelper from 'store';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { requestAdminMenu as requestAdminMenuAction } from 'calypso/state/admin-menu/actions';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { setUnseenCount } from 'calypso/state/notifications/actions';
import { didForceRefresh } from 'calypso/state/notifications-panel/actions';
import { shouldForceRefresh } from 'calypso/state/notifications-panel/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentLocaleVariant from 'calypso/state/selectors/get-current-locale-variant';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

import './style.scss';

/**
 * Returns whether or not the browser session
 * is currently visible to the user
 * @returns {boolean} is the browser session visible
 */
const getIsVisible = () => {
	if ( ! document ) {
		return true;
	}

	if ( ! document.visibilityState ) {
		return true;
	}

	return document.visibilityState === 'visible';
};

const isDesktop = config.isEnabled( 'desktop' );

// Keep the legacy panel in the Electron desktop app for now; the redesign is
// only enabled in the browser.
const isRedesignEnabled = config.isEnabled( 'notifications/redesign' ) && ! isDesktop;

let notificationAppModule;

const loadNotificationApp = () => {
	if ( ! notificationAppModule ) {
		notificationAppModule = isRedesignEnabled
			? import( '@automattic/notifications/src/app' )
			: import( '@automattic/notifications/src/panel/Notifications' );
	}

	return notificationAppModule;
};

const NotificationApp = lazy( loadNotificationApp );

// Read the memoized module rather than calling the loader, so this stays a
// no-op until the panel has actually mounted instead of fetching the chunk
// just to refresh a client that isn't there yet.
const refreshNotes = () => notificationAppModule?.then( ( module ) => module.refreshNotes() );

const debug = debugFactory( 'notifications:panel' );

const getMasterbarBell = () => document.querySelector( '.masterbar-notifications' );

const Notifications3PCNotice = ( { className } ) => {
	const translate = useTranslate();
	return (
		<div className={ `reader-notifications__3pc-notice ${ className }` }>
			<p>
				{ translate(
					"Didn't expect to see this page? {{learnMoreLink}}Learn about 3rd party cookies.{{/learnMoreLink}}",
					{
						components: {
							learnMoreLink: (
								<a href={ localizeUrl( 'https://wordpress.com/support/third-party-cookies/' ) } />
							),
						},
					}
				) }
			</p>
		</div>
	);
};

/**
 * Renders the new `apps/notifications` app following its own
 * mount-on-open lifecycle. On the masterbar it lives inside a `Dropdown`
 * anchored to the bell (so it owns its popover layout and outside-click
 * handling); on the dedicated `/reader/notifications` page it renders
 * inline, filling the content area.
 */
const RedesignedNotifications = ( {
	isShowing,
	isDedicatedReaderPage,
	locale,
	actionHandlers,
	closePanel,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	// Resolve the bell at measurement time: the masterbar remounts it when
	// the unseen count changes, so a captured node can go stale.
	const popoverAnchor = useMemo(
		() => ( {
			getBoundingClientRect: () => getMasterbarBell()?.getBoundingClientRect() ?? new DOMRect(),
		} ),
		[]
	);

	if ( isDedicatedReaderPage ) {
		return (
			<div className="reader-notifications__app">
				<Suspense fallback={ null }>
					<NotificationApp
						locale={ locale }
						isDismissible={ isMobile }
						actionHandlers={ actionHandlers }
						wpcom={ wpcom }
					/>
				</Suspense>
			</div>
		);
	}

	return (
		<Dropdown
			open={ isShowing }
			expandOnMobile={ isMobile }
			onToggle={ ( willOpen ) => {
				// Closing via Escape routes through here; opening is driven by
				// the masterbar bell, so there's nothing to do on `willOpen`.
				if ( ! willOpen ) {
					closePanel();
				}
			} }
			popoverProps={ {
				anchor: popoverAnchor,
				placement: 'bottom-start',
				offset: 8,
				focusOnMount: true,
				flip: false,
				shift: true,
				onFocusOutside: () => {
					// Clicking the bell while the panel is open should let the
					// bell's own toggle close it; suppress the popover's
					// focus-outside close to avoid a close-then-reopen race.
					if ( getMasterbarBell()?.contains( document.activeElement ) ) {
						return;
					}
					closePanel();
				},
			} }
			renderToggle={ () => null }
			renderContent={ () => (
				<Suspense fallback={ null }>
					<NotificationApp
						locale={ locale }
						isDismissible={ isMobile }
						actionHandlers={ actionHandlers }
						wpcom={ wpcom }
					/>
				</Suspense>
			) }
		/>
	);
};

export class Notifications extends Component {
	state = {
		// Desktop: override isVisible to maintain active polling for native UI elements (e.g. notification badge)
		isVisible: isDesktop ? true : getIsVisible(),
	};

	focusedElementBeforeOpen = null;

	actionHandlers = {
		APP_RENDER_NOTES: [
			( store, { newNoteCount } ) => {
				localStorageHelper.set( 'wpnotes_unseen_count', newNoteCount );
				this.props.setUnseenCount( newNoteCount );
			},
		],
		OPEN_LINK: [
			( store, { href, tracksEvent } ) => {
				if ( tracksEvent ) {
					this.props.recordTracksEventAction( 'calypso_notifications_' + tracksEvent, {
						link: href,
					} );
				}
				window.open( href, '_blank' );
			},
		],
		OPEN_POST: [
			( store, { siteId, postId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_post', {
					site_id: siteId,
					post_id: postId,
				} );
				page( `/reader/blogs/${ siteId }/posts/${ postId }` );
			},
		],
		OPEN_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/reader/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` );
			},
		],
		OPEN_SITE: [
			( store, { siteId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_open_site', {
					site_id: siteId,
				} );
				page( `/reader/blogs/${ siteId }` );
			},
		],
		VIEW_SETTINGS: [
			() => {
				this.props.checkToggle();
				page( '/me/notifications' );
			},
		],
		EDIT_COMMENT: [
			( store, { siteId, postId, commentId } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_edit_comment', {
					site_id: siteId,
					post_id: postId,
					comment_id: commentId,
				} );
				page( `/comment/${ siteId }/${ commentId }?action=edit` );
			},
		],
		ANSWER_PROMPT: [
			( store, { siteId, href } ) => {
				this.props.checkToggle();
				this.props.recordTracksEventAction( 'calypso_notifications_answer_prompt', {
					site_id: siteId,
				} );
				window.open( href, '_blank' );
			},
		],
		CLOSE_PANEL: [
			() => {
				this.props.checkToggle();
			},
		],
		APPROVE_NOTE: [
			() => {
				this.props.requestAdminMenu( this.props.selectedSiteId );
			},
		],
		NOTES_REMOVE: [
			( _, { isComment } ) => {
				if ( isComment ) {
					this.props.requestAdminMenu( this.props.selectedSiteId );
				}
			},
		],
	};

	componentDidMount() {
		if ( isRedesignEnabled ) {
			// The app owns its outside-click handling (via the Dropdown) and its
			// own keyboard shortcuts (`n` to close, `i` for the shortcuts
			// popover). We only need a global `n` to open it from elsewhere.
			document.addEventListener( 'keydown', this.handleRedesignKeyPress );
		} else {
			document.addEventListener( 'click', this.props.checkToggle );
			document.addEventListener( 'keydown', this.handleKeyPress );

			if ( typeof document.hidden !== 'undefined' ) {
				document.addEventListener( 'visibilitychange', this.handleVisibilityChange );
			}
		}

		if ( this.props.isShowing ) {
			this.focusedElementBeforeOpen = document.activeElement;
		}

		if (
			'serviceWorker' in window.navigator &&
			'addEventListener' in window.navigator.serviceWorker
		) {
			window.navigator.serviceWorker.addEventListener(
				'message',
				this.receiveServiceWorkerMessage
			);
			this.postServiceWorkerMessage( { action: 'sendQueuedMessages' } );
		}

		this.maybeForceRefresh();
	}

	// Honor a requested force-refresh (e.g. dispatched from the desktop app) in
	// the commit phase rather than during render, where it ran on every —
	// possibly discarded — render attempt under concurrent rendering.
	maybeForceRefresh() {
		if ( this.props.forceRefresh ) {
			debug( 'Refreshing notes panel...' );
			refreshNotes();
			this.props.didForceRefresh();
		}
	}

	componentDidUpdate( prevProps ) {
		this.maybeForceRefresh();

		if ( prevProps.isShowing === this.props.isShowing ) {
			return;
		}

		if ( ! prevProps.isShowing && this.props.isShowing ) {
			this.focusedElementBeforeOpen = document.activeElement;
		} else {
			this.focusedElementBeforeOpen?.focus();
		}
	}

	componentWillUnmount() {
		if ( isRedesignEnabled ) {
			document.removeEventListener( 'keydown', this.handleRedesignKeyPress );
		} else {
			document.removeEventListener( 'click', this.props.checkToggle );
			document.removeEventListener( 'keydown', this.handleKeyPress );

			if ( typeof document.hidden !== 'undefined' ) {
				document.removeEventListener( 'visibilitychange', this.handleVisibilityChange );
			}
		}

		if (
			'serviceWorker' in window.navigator &&
			'removeEventListener' in window.navigator.serviceWorker
		) {
			window.navigator.serviceWorker.removeEventListener(
				'message',
				this.receiveServiceWorkerMessage
			);
		}

		window.removeEventListener( 'message', this.handleDesktopNotificationMarkAsRead );
	}

	handleKeyPress = ( event ) => {
		if ( event.target !== document.body && event.target.tagName !== 'A' ) {
			return;
		}
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		// 'n' key should toggle the notifications frame
		if ( 78 === event.keyCode ) {
			event.stopPropagation();
			event.preventDefault();
			this.props.checkToggle( null, true );
		}

		if ( 27 === event.keyCode && this.props.isShowing ) {
			event.stopPropagation();
			event.preventDefault();
			this.props.checkToggle( null, true );
		}
	};

	// Redesign: `n` opens the panel. Closing is handled by the app's own
	// shortcut (which dispatches CLOSE_PANEL → checkToggle) once it is mounted.
	handleRedesignKeyPress = ( event ) => {
		if ( event.target !== document.body && event.target.tagName !== 'A' ) {
			return;
		}
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		if ( 78 === event.keyCode && ! this.props.isShowing ) {
			event.stopPropagation();
			event.preventDefault();
			this.props.checkToggle( null, true, true );
		}
	};

	closePanel = () => this.props.checkToggle( null, true );

	// Desktop: override isVisible to maintain active polling for native UI elements (e.g. notification badge)
	handleVisibilityChange = () => this.setState( { isVisible: isDesktop ? true : getIsVisible() } );

	receiveServiceWorkerMessage = ( event ) => {
		// Receives messages from the service worker
		// Older Firefox versions (pre v48) set event.origin to "" for service worker messages
		// Firefox does not support document.origin; we can use location.origin instead
		if ( event.origin && event.origin !== window.location.origin ) {
			return;
		}

		if ( ! ( 'action' in event.data ) ) {
			return;
		}

		switch ( event.data.action ) {
			case 'openPanel':
				// Ensure panel is opened.
				this.props.checkToggle( null, true, true );
				return refreshNotes();

			case 'trackClick':
				recordTracksEvent( 'calypso_web_push_notification_clicked', {
					push_notification_note_id: event.data.notification.note_id,
					push_notification_type: event.data.notification.type,
				} );

				return;
		}
	};

	postServiceWorkerMessage = ( message ) => {
		if ( ! ( 'serviceWorker' in window.navigator ) ) {
			return;
		}

		window.navigator.serviceWorker.ready.then(
			( registration ) => 'active' in registration && registration.active.postMessage( message )
		);
	};

	render() {
		const localeSlug = this.props.currentLocaleSlug || config( 'i18n_default_locale_slug' );
		const isDedicatedReaderPage = this.props.currentRoute?.startsWith( '/reader/notifications' );

		if ( isRedesignEnabled ) {
			const redesigned = (
				<RedesignedNotifications
					isShowing={ this.props.isShowing }
					isDedicatedReaderPage={ isDedicatedReaderPage }
					locale={ localeSlug }
					actionHandlers={ this.actionHandlers }
					closePanel={ this.closePanel }
				/>
			);

			// On the dedicated page, stack the cookie notice above the panel as a
			// normal-flow banner (the legacy flyout's absolutely-positioned notice
			// doesn't apply without `#wpnc-panel`).
			if ( isDedicatedReaderPage ) {
				return (
					<div className="reader-notifications__app-page">
						<Notifications3PCNotice className="reader-notifications__3pc-notice-page" />
						{ redesigned }
					</div>
				);
			}

			return redesigned;
		}

		return (
			<>
				{ /*
					Due to how the notifs panel width is set differently on this page to control fly-out vs. in place
					nested levels, this notice makes sense at different places in the DOM depending on the
					breakpoint. We remove display for one or the other via CSS depending on the breakpoint.
				*/ }
				{ isDedicatedReaderPage && (
					<Notifications3PCNotice className="reader-notifications__3pc-notice-external" />
				) }
				<div
					id="wpnc-panel"
					className={ clsx( 'wide', 'wpnc__main', {
						'wpnt-open': this.props.isShowing,
						'wpnt-closed': ! this.props.isShowing,
					} ) }
				>
					{ isDedicatedReaderPage && (
						<Notifications3PCNotice className="reader-notifications__3pc-notice-internal" />
					) }
					<Suspense fallback={ null }>
						<NotificationApp
							actionHandlers={ this.actionHandlers }
							isShowing={ this.props.isShowing }
							isVisible={ this.state.isVisible }
							locale={ localeSlug }
							wpcom={ wpcom }
						/>
					</Suspense>
				</div>
			</>
		);
	}
}

export default connect(
	( state ) => ( {
		currentLocaleSlug: getCurrentLocaleVariant( state ) || getCurrentLocaleSlug( state ),
		forceRefresh: shouldForceRefresh( state ),
		selectedSiteId: getSelectedSiteId( state ),
		currentRoute: getCurrentRoute( state ),
	} ),
	( dispatch ) => ( {
		recordTracksEventAction: ( name, properties ) =>
			dispatch( recordTracksEventAction( name, properties ) ),
		setUnseenCount: ( count ) => dispatch( setUnseenCount( count ) ),
		didForceRefresh: () => dispatch( didForceRefresh() ),
		requestAdminMenu: ( siteId ) => dispatch( requestAdminMenuAction( siteId ) ),
	} )
)( Notifications );
