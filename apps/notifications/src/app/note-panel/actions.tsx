import { MenuGroup, MenuItem, DropdownMenu } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { connect } from 'react-redux';
import actions from '../../panel/state/actions';

function NotePanelActions( { viewSettings }: { viewSettings: () => void } ) {
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Actions' ) }>
			{ ( { onClose } ) => (
				<MenuGroup>
					<MenuItem
						onClick={ () => {
							onClose();
							viewSettings();
						} }
					>
						{ __( 'Settings' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

const mapDispatchToProps = {
	viewSettings: actions.ui.viewSettings,
};

export default connect( null, mapDispatchToProps )( NotePanelActions );
