import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

interface DnsActionsMenuProps {
	hasDefaultARecords: boolean;
	hasDefaultCnameRecord: boolean;
	hasDefaultEmailRecords: boolean;
	onRestoreDefaultARecords: () => void;
	onRestoreDefaultCnameRecord: () => void;
	onRestoreDefaultEmailRecords: () => void;
}

const DnsActionsMenu = ( {
	hasDefaultARecords,
	hasDefaultCnameRecord,
	hasDefaultEmailRecords,
	onRestoreDefaultARecords,
	onRestoreDefaultCnameRecord,
	onRestoreDefaultEmailRecords,
}: DnsActionsMenuProps ) => {
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Restore default DNS records' ) }>
			{ ( { onClose } ) => (
				<MenuGroup className="dashboard-domains-overview-dns-actions-menu__menu-group">
					<MenuItem
						disabled={ hasDefaultARecords }
						onClick={ () => {
							onClose();
							onRestoreDefaultARecords();
						} }
					>
						{ __( 'Restore default A records' ) }
					</MenuItem>
					<MenuItem
						disabled={ hasDefaultCnameRecord }
						onClick={ () => {
							onClose();
							onRestoreDefaultCnameRecord();
						} }
					>
						{ __( 'Restore default CNAME record' ) }
					</MenuItem>
					<MenuItem
						disabled={ hasDefaultEmailRecords }
						onClick={ () => {
							onClose();
							onRestoreDefaultEmailRecords();
						} }
					>
						{ __( 'Restore default email records' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export default DnsActionsMenu;
