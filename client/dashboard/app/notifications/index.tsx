import { useNavigate } from '@tanstack/react-router';
import { Button, Dropdown } from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import { Suspense, lazy } from 'react';
import wpcom from 'calypso/lib/wp';

const AsyncNotificationApp = lazy( () => import( '@automattic/notifications/src/app' ) );

export default function Notifications( { className }: { className: string } ) {
	const navigate = useNavigate();

	const actionHandlers = ( onClosePanel: () => void ) => ( {
		VIEW_SETTINGS: [
			() => {
				onClosePanel();
				navigate( { to: '/me/notifications' } );
			},
		],
		CLOSE_PANEL: [ onClosePanel ],
	} );

	// TODO: fetch unread notifications count
	const hasUnreadNotifications = false;

	return (
		<Dropdown
			popoverProps={ {
				placement: 'bottom-end',
				offset: 8,
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className={ className }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					variant="tertiary"
					label={ __( 'Notifications' ) }
					icon={ hasUnreadNotifications ? bellUnread : bell }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<div style={ { width: '480px', margin: '-8px' } }>
					<Suspense fallback={ null }>
						<AsyncNotificationApp actionHandlers={ actionHandlers( onClose ) } wpcom={ wpcom } />
					</Suspense>
				</div>
			) }
		/>
	);
}
