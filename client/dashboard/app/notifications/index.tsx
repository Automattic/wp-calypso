import { isEnabled } from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import { Button, Dropdown } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import clsx from 'clsx';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { isCookieAuthMissing } from 'wpcom-proxy-request';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
import { useLocale } from '../locale';
import { omnibarEvents, useOmnibarEvent } from '../omnibar/events';
import './style.scss';

const AsyncNotificationApp = lazy( () => import( '@automattic/notifications/src/app' ) );

/**
 * The panel that the notifications bell opens authenticates its API requests
 * through the `wpcom-proxy-request` iframe, which relies on third-party
 * cookies. When the browser blocks them the request fails and the panel's REST
 * client retries forever, leaving it stuck on a spinner. The dedicated
 * `/reader/notifications` page is served same-origin and doesn't need the
 * proxy, so — matching the old masterbar bell — fall back to a full-page
 * redirect there instead of opening the panel.
 */
const NOTIFICATIONS_FALLBACK_URL = '/reader/notifications';

/**
 * Polls the proxy iframe's cookie-auth flag while `enabled`. The iframe reports
 * the missing cookie asynchronously after it loads, so the value can flip from
 * `false` to `true` shortly after the panel opens.
 */
function useIsCookieAuthMissing( enabled: boolean ) {
	const [ isMissing, setIsMissing ] = useState( () => isCookieAuthMissing() );

	useEffect( () => {
		if ( ! enabled || isMissing ) {
			return;
		}
		const intervalId = setInterval( () => {
			if ( isCookieAuthMissing() ) {
				setIsMissing( true );
			}
		}, 1000 );
		return () => clearInterval( intervalId );
	}, [ enabled, isMissing ] );

	return isMissing;
}

export default function Notifications( {
	className,
	anchor,
}: {
	className?: string;
	/** When true, hides the built-in toggle button (the omnibar provides its own). */
	anchor?: boolean;
} ) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const locale = useLocale();
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const { isShown: isHelpCenterShown, setShowHelpCenter } = useHelpCenter();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ hasUnseenNotifications, setHasUnseenNotifications ] = useState( user.has_unseen_notes );
	const [ anchorEl, setAnchorEl ] = useState< HTMLElement | null >( null );
	const isCookieAuthMissingValue = useIsCookieAuthMissing( isOpen );

	// The masterbar remounts the bell when the unseen count changes, detaching any
	// cached node. Resolve the live bell at measurement time so the popover stays
	// anchored, falling back to the captured node while it is still connected.
	const popoverAnchor = useMemo(
		() => ( {
			getBoundingClientRect: () =>
				( anchorEl?.isConnected
					? anchorEl
					: document.querySelector< HTMLElement >( '#wpcom-omnibar .masterbar-notifications' )
				)?.getBoundingClientRect() ?? new DOMRect(),
		} ),
		[ anchorEl ]
	);

	// When third-party cookies are blocked the panel can't load, so navigate to
	// the same-origin notifications page instead of opening it.
	const redirectToNotificationsPage = useCallback( () => {
		window.location.href = NOTIFICATIONS_FALLBACK_URL;
	}, [] );

	const handleToggle = ( willOpen: boolean ) => {
		if ( willOpen ) {
			if ( isCookieAuthMissing() ) {
				redirectToNotificationsPage();
				return;
			}
			setShowHelpCenter( false, undefined, true );
		}
		setIsOpen( willOpen );
	};

	// Close notifications when help center opens.
	useEffect( () => {
		if ( isHelpCenterShown ) {
			setIsOpen( false );
		}
	}, [ isHelpCenterShown ] );

	// Keep the omnibar button in sync with the panel open state.
	useEffect( () => {
		omnibarEvents.notificationsOpen.emit( isOpen );
	}, [ isOpen ] );

	const handleClose = () => {
		handleToggle( false );
	};

	const actionHandlers = {
		APP_RENDER_NOTES: [
			( store: unknown, { newNoteCount }: { newNoteCount: number } ) => {
				setHasUnseenNotifications( newNoteCount > 0 );
				omnibarEvents.notificationsUnseenCount.emit( newNoteCount );
			},
		],
		VIEW_SETTINGS: [
			() => {
				handleClose();
				navigate( { to: '/me/notifications' } );
			},
		],
		EDIT_COMMENT: [
			( store: unknown, { href }: { href: string } ) => {
				window.open( href, '_blank' );
			},
		],
		ANSWER_PROMPT: [
			( store: unknown, { href }: { href: string } ) => {
				window.open( href, '_blank' );
			},
		],
		CLOSE_PANEL: [ handleClose ],
	};

	const handleOmnibarToggle = useCallback( () => {
		if ( ! isOpen && isCookieAuthMissing() ) {
			redirectToNotificationsPage();
			return;
		}
		setIsOpen( ( prev ) => {
			if ( ! prev ) {
				setShowHelpCenter( false, undefined, true );
			}
			return ! prev;
		} );
	}, [ isOpen, redirectToNotificationsPage, setShowHelpCenter ] );

	// The proxy iframe may only report the blocked cookie after the panel has
	// already opened; redirect as soon as we detect it so it can't spin forever.
	useEffect( () => {
		if ( isOpen && isCookieAuthMissingValue ) {
			redirectToNotificationsPage();
		}
	}, [ isOpen, isCookieAuthMissingValue, redirectToNotificationsPage ] );

	useOmnibarEvent( 'notificationsAnchor', setAnchorEl );
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

	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-start',
				offset: 8,
				focusOnMount: true,
				flip: false,
				shift: true,
				...( anchor ? { anchor: popoverAnchor } : anchorEl && { anchor: anchorEl } ),
				...( isEnabled( 'dashboard/omnibar' ) && {
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
				} ),
			} }
			open={ isOpen }
			expandOnMobile={ isMobileViewport }
			onToggle={ handleToggle }
			renderToggle={ ( { isOpen, onToggle } ) =>
				anchor ? null : (
					<Button
						className={ clsx( className, 'dashboard-notifications__icon' ) }
						onClick={ onToggle }
						aria-expanded={ isOpen }
						variant="tertiary"
						label={ __( 'Notifications' ) }
						icon={ hasUnseenNotifications ? bellUnread : bell }
					/>
				)
			}
			renderContent={ () => (
				<Suspense fallback={ null }>
					<AsyncNotificationApp
						locale={ locale }
						isDismissible={ isMobileViewport }
						actionHandlers={ actionHandlers }
						wpcom={ wpcom }
					/>
				</Suspense>
			) }
		/>
	);
}
