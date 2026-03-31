import { isEnabled } from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import { Button, Dropdown } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import clsx from 'clsx';
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../auth';
import { useHelpCenter } from '../help-center';
import { useOmnibarEvent } from '../interim-omnibar/click-handlers';
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

	const handleToggle = ( willOpen: boolean ) => {
		if ( willOpen ) {
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

	const handleClose = () => {
		handleToggle( false );
	};

	const actionHandlers = {
		APP_RENDER_NOTES: [
			( store: unknown, { newNoteCount }: { newNoteCount: number } ) => {
				setHasUnseenNotifications( newNoteCount > 0 );
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

	const handleOmnibarToggle = useCallback(
		( element: HTMLElement | null ) => {
			setAnchorEl( element );
			setIsOpen( ( prev ) => {
				if ( ! prev ) {
					setShowHelpCenter( false, undefined, true );
				}
				return ! prev;
			} );
		},
		[ setShowHelpCenter ]
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
				handleToggle( true );
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [] );

	return (
		<Dropdown
			popoverProps={ {
				className: 'dashboard-notifications',
				placement: 'bottom-end',
				offset: 8,
				focusOnMount: true,
				...( anchorEl && { anchor: anchorEl } ),
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
				<div
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
			) }
		/>
	);
}
