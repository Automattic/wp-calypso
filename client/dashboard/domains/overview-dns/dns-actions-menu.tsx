import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

const DnsActionsMenu = () => {
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					<MenuItem onClick={ () => {} }>{ __( 'Restore default A records ↗' ) }</MenuItem>
					<MenuItem onClick={ () => {} }>{ __( 'Restore default CNAME record ↗' ) }</MenuItem>
					<MenuItem onClick={ () => {} }>{ __( 'Restore default email records ↗' ) }</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export default DnsActionsMenu;
