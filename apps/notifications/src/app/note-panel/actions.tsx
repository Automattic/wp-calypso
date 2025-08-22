import { MenuGroup, MenuItem, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
import actions from '../../panel/state/actions';

export default function NotePanelActions() {
	const dispatch = useDispatch();

	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Actions' ) }>
			{ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onClose();
							dispatch( actions.ui.viewSettings() );
						} }
					>
						{ __( 'Settings' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}
