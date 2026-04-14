import { isEnabled } from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import { Button, Popover } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import clsx from 'clsx';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
import { omnibarEvents, useOmnibarEvent } from '../interim-omnibar/omnibar-events';
import { useLocale } from '../locale';
import './style.scss';

const AsyncNotificationApp = lazy( () => import( '@automattic/notifications/src/app' ) );

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
	const buttonRef = useRef< HTMLButtonElement | null >( null );
	const panelRef = useRef< HTMLDivElement | null >( null );

	const handleClose = useCallback( () => {
		setIsOpen( false );
	}, [] );

	const handleOpen = useCallback( () => {
		setShowHelpCenter( false, undefined, true );
		setIsOpen( true );
	}, [ setShowHelpCenter ] );

	// Close notifications when help center opens.
	useEffect( () => {
		if ( isHelpCenterShown ) {
			setIsOpen( false );
		}
	}, [ isHelpCenterShown ] );

	const actionHandlers = useMemo(
		() => ( {
			APP_RENDER_NOTES: [
				( _store: unknown, { newNoteCount }: { newNoteCount: number } ) => {
					setHasUnseenNotifications( newNoteCount > 0 );
					omnibarEvents.notificationsUnseenCount.emit( newNoteCount );
				},
			],
			VIEW_SETTINGS: [
				() => {
					setIsOpen( false );
					navigate( { to: '/me/notifications' } );
				},
			],
			EDIT_COMMENT: [
				( _store: unknown, { href }: { href: string } ) => {
					window.open( href, '_blank' );
				},
			],
			ANSWER_PROMPT: [
				( _store: unknown, { href }: { href: string } ) => {
					window.open( href, '_blank' );
				},
			],
			CLOSE_PANEL: [ () => setIsOpen( false ) ],
		} ),
		[ navigate ]
	);

	const handleOmnibarToggle = useCallback( () => {
		setIsOpen( ( prev ) => {
			if ( ! prev ) {
				setShowHelpCenter( false, undefined, true );
			}
			return ! prev;
		} );
	}, [ setShowHelpCenter ] );

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

	// When opening, move focus into the panel.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		const focusable = panelRef.current?.querySelector< HTMLElement >(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		focusable?.focus();
	}, [ isOpen ] );

	// Click outside to close (Popover's own focus-outside only fires when
	// focus was inside; for a panel that may not have been focused we need
	// a pointerdown listener.)
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		const handlePointerDown = ( event: PointerEvent ) => {
			const target = event.target as Node | null;
			if ( ! target ) {
				return;
			}
			if ( panelRef.current?.contains( target ) ) {
				return;
			}
			if ( buttonRef.current?.contains( target ) ) {
				return;
			}
			if ( anchorEl?.contains( target ) ) {
				return;
			}
			if ( isEnabled( 'dashboard/omnibar' ) ) {
				const omnibar = document.getElementById( 'wpcom-omnibar' );
				if ( omnibar?.contains( target ) ) {
					return;
				}
			}
			setIsOpen( false );
		};
		document.addEventListener( 'pointerdown', handlePointerDown, true );
		return () => {
			document.removeEventListener( 'pointerdown', handlePointerDown, true );
		};
	}, [ isOpen, anchorEl ] );

	const popoverAnchor = anchorEl ?? buttonRef.current;

	return (
		<>
			{ ! anchor && (
				<Button
					ref={ buttonRef }
					className={ clsx( className, 'dashboard-notifications__icon' ) }
					onClick={ () => ( isOpen ? handleClose() : handleOpen() ) }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'Notifications' ) }
					icon={ hasUnseenNotifications ? bellUnread : bell }
				/>
			) }
			<Popover
				className={ clsx( 'dashboard-notifications', {
					'dashboard-notifications--hidden': ! isOpen,
				} ) }
				placement="bottom-end"
				offset={ 8 }
				anchor={ popoverAnchor ?? undefined }
				focusOnMount={ false }
				expandOnMobile={ isMobileViewport }
				onClose={ handleClose }
			>
				<div
					ref={ panelRef }
					aria-hidden={ ! isOpen }
					style={ {
						width: '100vw',
						height: '100vh',
						maxWidth: ! isMobileViewport ? '448px' : undefined,
						maxHeight: 'inherit',
						margin: '-8px',
					} }
				>
					<Suspense fallback={ null }>
						<AsyncNotificationApp
							locale={ locale }
							isDismissible={ isMobileViewport }
							actionHandlers={ actionHandlers }
							wpcom={ wpcom }
						/>
					</Suspense>
				</div>
			</Popover>
		</>
	);
}
