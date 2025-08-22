import { useNavigate } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import wpcom from 'calypso/lib/wp';

const AsyncNoteDropdown = lazy( () => import( '@automattic/notifications/src/dropdown' ) );

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

	return (
		<Suspense fallback={ null }>
			<AsyncNoteDropdown
				className={ className }
				actionHandlers={ actionHandlers }
				wpcom={ wpcom }
			/>
		</Suspense>
	);
}
