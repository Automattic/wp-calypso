import { useNavigate } from '@tanstack/react-router';
import { Button, Dropdown } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import clsx from 'clsx';
import { Suspense, lazy, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../auth';
import { useLocale } from '../locale';
import './style.scss';

const AsyncNotificationApp = lazy( () => import( '@automattic/notifications/src/app' ) );

export default function Notifications( { className }: { className: string } ) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const locale = useLocale();
	const [ hasUnseenNotifications, setHasUnseenNotifications ] = useState( user.has_unseen_notes );

	const actionHandlers = ( onClosePanel: () => void ) => ( {
		APP_RENDER_NOTES: [
			( store: any, { newNoteCount }: { newNoteCount: number } ) => {
				setHasUnseenNotifications( newNoteCount > 0 );
			},
		],
		VIEW_SETTINGS: [
			() => {
				onClosePanel();
				navigate( { to: '/me/notifications' } );
			},
		],
		CLOSE_PANEL: [ onClosePanel ],
	} );

	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
				focusOnMount: true,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className={ clsx( className, 'dashboard-notifications__icon' ) }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'Notifications' ) }
					icon={ hasUnseenNotifications ? bellUnread : bell }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<div style={ { width: '480px', height: '100vh', maxHeight: 'inherit', margin: '-8px' } }>
					<Suspense fallback={ null }>
						<AsyncNotificationApp
							locale={ locale }
							actionHandlers={ actionHandlers( onClose ) }
							wpcom={ wpcom }
						/>
					</Suspense>
				</div>
			) }
		/>
	);
}
