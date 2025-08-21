import { Button, Dropdown } from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { bellUnread, bell } from '@wordpress/icons';
import NotificationApp from '../app';

const NoteDropdown = ( {
	className,
	wpcom,
	onNavigate,
}: {
	className?: string;
	wpcom: any;
	onNavigate: ( path: string ) => void;
} ) => {
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
			renderContent={ ( { onClose } ) => {
				const handleNavigate = ( path: string ) => {
					onNavigate( path );
					onClose();
				};
				return (
					<div style={ { width: '480px', margin: '-8px' } }>
						<NotificationApp wpcom={ wpcom } onNavigate={ handleNavigate } />
					</div>
				);
			} }
		/>
	);
};

export default NoteDropdown;
