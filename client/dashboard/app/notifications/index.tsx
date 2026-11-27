import config from '@automattic/calypso-config';
import { Button, Dropdown } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { bell } from '@wordpress/icons';
import clsx from 'clsx';
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { Text } from '../../components/text';
import { dashboardLink } from '../../utils/link';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
import { useLocale } from '../locale';
import { omnibarEvents, useOmnibarEvent } from '../omnibar/events';
import { NOTIFICATIONS_ICON_CLASS } from '../omnibar/notifications-node/icon-class';
import useSubscriberAlerts from './use-subscriber-alerts';
import './style.scss';
import type { NotificationsPanelView } from './panel-view';

const AsyncNotificationApp = lazy( () => import( '@automattic/notifications/src/app' ) );

const TRACKS_SURFACE = 'dashboard_panel';

/**
 * Returns the position of the omnibar bell, or the end of the omnibar when the bell is missing.
 */
function getBellRect() {
	const omnibar = document.getElementById( 'wpcom-omnibar' );
	const bell = omnibar?.querySelector( `.${ NOTIFICATIONS_ICON_CLASS }` )?.closest( 'a' );
	if ( bell ) {
		return bell.getBoundingClientRect();
	}
	const { top = 0, height = 0 } = omnibar?.getBoundingClientRect() ?? {};
	const x = isRTL() ? 0 : document.documentElement.clientWidth;
	return new DOMRect( x, top, 0, height );
}

const bellAnchor = { getBoundingClientRect: getBellRect };

type LinkAction = {
	href: string;
	siteId?: string;
	postId?: string;
	commentId?: string;
	tracksEvent?: string;
};

export default function Notifications( {
	className,
	anchor,
	isInboxShown = false,
	onOpenInbox,
}: {
	className?: string;
	/** When true, hides the built-in toggle button (the omnibar provides its own). */
	anchor?: boolean;
	isInboxShown?: boolean;
	onOpenInbox?: ( view: NotificationsPanelView ) => void;
} ) {
	const { user } = useAuth();
	const locale = useLocale();
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ hasUnseenNotifications, setHasUnseenNotifications ] = useState( user.has_unseen_notes );
	const unseenCountRef = useRef< number | undefined >( user.has_unseen_notes ? undefined : 0 );
	const { recordTracksEvent } = useAnalytics();
	const isViewSettingsEnabled = config.isEnabled( 'notifications/view-settings' );
	const isMarkAsUnreadEnabled = config.isEnabled( 'notifications/mark-as-unread' );
	const onNotificationCount = useCallback( ( count: number ) => {
		unseenCountRef.current = count;
		setHasUnseenNotifications( count > 0 );
		omnibarEvents.notificationsUnseenCount.emit( count );
	}, [] );
	useSubscriberAlerts( onNotificationCount, isViewSettingsEnabled );

	const handleToggle = useCallback(
		( willOpen: boolean ) => {
			if ( willOpen ) {
				setShowHelpCenter( false, undefined, true );
				recordTracksEvent( 'calypso_notification_open', {
					surface: TRACKS_SURFACE,
					unread_notifications: unseenCountRef.current,
					unread_notifications_known: unseenCountRef.current !== undefined,
					on_full_page: isInboxShown,
				} );
			}
			setIsOpen( willOpen );
		},
		[ isInboxShown, setShowHelpCenter, recordTracksEvent ]
	);

	// Close notifications when help center opens.
	useEffect( () => {
		if ( isHelpCenterShown ) {
			setIsOpen( false );
		}
	}, [ isHelpCenterShown ] );

	// Opening the full page closes the panel it was opened from.
	useEffect( () => {
		if ( isInboxShown ) {
			setIsOpen( false );
		}
	}, [ isInboxShown ] );

	// On the full page, the panel stays open when the user moves into the page without leaving the
	// panel first: from the omnibar, which onFocusOutside below leaves alone, or after its focus fell
	// to the body. Close it on a click or focus in the page then, before the page acts on it.
	useEffect( () => {
		if ( ! isOpen || ! isInboxShown ) {
			return;
		}
		const isOnPage = ( target: EventTarget | null ) =>
			target instanceof Element &&
			! target.closest(
				'.components-popover, .components-modal__screen-overlay, [role="dialog"], #wpcom-omnibar'
			);
		// A press that starts in the panel and ends over the page, like selecting a note's text past the
		// panel's edge, fires its click on an element that holds both, which looks like the page. A click
		// without a press of its own, such as from the keyboard, goes by its target.
		let isPressOffPage = false;
		const rememberPress = ( { target }: PointerEvent ) => {
			isPressOffPage = ! isOnPage( target );
		};
		const closeOnClick = ( { target }: MouseEvent ) => {
			if ( isOnPage( target ) && ! isPressOffPage ) {
				setIsOpen( false );
			}
			isPressOffPage = false;
		};
		const closeOnFocus = ( { target }: FocusEvent ) => {
			if ( isOnPage( target ) ) {
				setIsOpen( false );
			}
		};
		document.addEventListener( 'pointerdown', rememberPress, true );
		document.addEventListener( 'click', closeOnClick, true );
		document.addEventListener( 'focusin', closeOnFocus );
		return () => {
			document.removeEventListener( 'pointerdown', rememberPress, true );
			document.removeEventListener( 'click', closeOnClick, true );
			document.removeEventListener( 'focusin', closeOnFocus );
		};
	}, [ isOpen, isInboxShown ] );

	// Keep the omnibar button in sync with the panel open state.
	useEffect( () => {
		omnibarEvents.notificationsOpen.emit( isOpen );
	}, [ isOpen ] );

	const handleClose = () => {
		handleToggle( false );
	};

	const openInNewTab = ( store: unknown, { href }: LinkAction ) => {
		window.open( href, '_blank', 'noopener' );
	};

	const trackAndOpen = ( name: string ) => ( store: unknown, action: LinkAction ) => {
		const { siteId, postId, commentId } = action;
		recordTracksEvent( name, {
			surface: TRACKS_SURFACE,
			site_id: siteId,
			post_id: postId,
			comment_id: commentId,
		} );
		openInNewTab( store, action );
	};

	const actionHandlers = {
		APP_RENDER_NOTES: [
			( store: unknown, { newNoteCount }: { newNoteCount: number } ) => {
				unseenCountRef.current = newNoteCount;
				setHasUnseenNotifications( newNoteCount > 0 );
				omnibarEvents.notificationsUnseenCount.emit( newNoteCount );
			},
		],
		VIEW_SETTINGS: [
			() => {
				// Open in a new tab so the current notification state is preserved.
				window.open( dashboardLink( '/me/notifications' ), '_blank' );
			},
		],
		EDIT_COMMENT: [ trackAndOpen( 'calypso_notifications_edit_comment' ) ],
		ANSWER_PROMPT: [ trackAndOpen( 'calypso_notifications_answer_prompt' ) ],
		OPEN_LINK: [
			( store: unknown, action: LinkAction ) => {
				if ( action.tracksEvent ) {
					const suffix = action.tracksEvent.toLowerCase().replace( /[^a-z0-9_]+/g, '_' );
					recordTracksEvent( 'calypso_notifications_' + suffix, {
						surface: TRACKS_SURFACE,
						link: action.href,
					} );
				}
				openInNewTab( store, action );
			},
		],
		OPEN_POST: [ trackAndOpen( 'calypso_notifications_open_post' ) ],
		OPEN_COMMENT: [ trackAndOpen( 'calypso_notifications_open_comment' ) ],
		OPEN_SITE: [ trackAndOpen( 'calypso_notifications_open_site' ) ],
		CLOSE_PANEL: [ handleClose ],
	};

	const handleOmnibarToggle = useCallback(
		() => handleToggle( ! isOpen ),
		[ handleToggle, isOpen ]
	);

	useOmnibarEvent( 'notifications', handleOmnibarToggle );

	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( event.target !== document.body ) {
				return;
			}
			if ( event.altKey || event.ctrlKey || event.metaKey ) {
				return;
			}
			if ( event.key === 'n' ) {
				event.stopPropagation();
				event.preventDefault();
				handleOmnibarToggle();
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ handleOmnibarToggle ] );

	const dropdown = (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-start',
				offset: 8,
				focusOnMount: true,
				flip: false,
				shift: true,
				// Render in place so the popover is positioned against the fixed
				// container below. Portalled to the body, its coordinates are
				// document-relative and have to be recomputed on every scroll
				// frame, which visibly lags behind the fixed masterbar.
				...( anchor && { inline: true, anchor: bellAnchor } ),
				onFocusOutside: () => {
					// When focus moves to the omnibar (e.g. clicking the
					// omnibar notification bell), suppress the Popover's
					// auto-close and let the omnibar event handle the toggle
					// instead. Without this, the Popover's focus-outside close
					// races with the omnibar's toggle event, causing the panel
					// to close then immediately reopen.
					const omnibar = document.getElementById( 'wpcom-omnibar' );
					if ( omnibar?.contains( document.activeElement ) ) {
						return;
					}
					setIsOpen( false );
				},
			} }
			open={ isOpen }
			expandOnMobile={ isMobileViewport }
			onToggle={ handleToggle }
			renderToggle={ ( { isOpen, onToggle } ) =>
				anchor ? null : (
					<Button
						className={ clsx( className, 'dashboard-notifications__icon', {
							'is-unread': hasUnseenNotifications,
						} ) }
						onClick={ onToggle }
						aria-expanded={ isOpen }
						variant="tertiary"
						label={ __( 'Notifications' ) }
						icon={ bell }
					/>
				)
			}
			renderContent={ () => (
				<Suspense
					fallback={
						<Text variant="muted" style={ { display: 'block', padding: '8px 12px' } }>
							{ __( 'Loading…' ) }
						</Text>
					}
				>
					<AsyncNotificationApp
						locale={ locale }
						isDismissible={ isMobileViewport }
						isViewSettingsEnabled={ isViewSettingsEnabled }
						isMarkAsUnreadEnabled={ isMarkAsUnreadEnabled }
						// There's no full view to open from the full page.
						onOpenFullView={ isInboxShown ? undefined : onOpenInbox }
						tracksSurface={ TRACKS_SURFACE }
						actionHandlers={ actionHandlers }
						wpcom={ wpcom }
					/>
				</Suspense>
			) }
		/>
	);

	if ( ! anchor ) {
		return dropdown;
	}

	return <div className="dashboard-notifications__popover-container">{ dropdown }</div>;
}
