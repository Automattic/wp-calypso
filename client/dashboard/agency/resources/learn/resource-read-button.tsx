import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';

export default function ResourceReadButton( {
	isRead,
	onChange,
}: {
	isRead: boolean;
	onChange: () => void;
} ) {
	return (
		<Button
			className="resource-read-button"
			variant="tertiary"
			size="small"
			icon={ isRead ? check : undefined }
			aria-pressed={ isRead }
			label={ isRead ? __( 'Mark as unread' ) : __( 'Mark as read' ) }
			onClick={ onChange }
		>
			{ isRead ? __( 'Read' ) : __( 'Mark as read' ) }
		</Button>
	);
}
