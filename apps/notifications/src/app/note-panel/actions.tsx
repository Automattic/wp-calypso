import { MenuGroup, MenuItem, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

export default function NotePanelActions( {
	onNavigate,
}: {
	onNavigate: ( path: string ) => void;
} ) {
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Actions' ) }>
			{ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onNavigate( '/me/notifications' );
							onClose();
						} }
					>
						{ __( 'Settings' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}
