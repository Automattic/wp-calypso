import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';

const DnsActionsMenu = ( {
	hasDefaultARecords,
	hasDefaultCnameRecord,
	hasDefaultEmailRecords,
}: {
	hasDefaultARecords: boolean;
	hasDefaultCnameRecord: boolean;
	hasDefaultEmailRecords: boolean;
} ) => {
	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					<MenuItem disabled={ hasDefaultARecords } onClick={ () => {} }>
						{ __( 'Restore default A records ↗' ) }
					</MenuItem>
					<MenuItem disabled={ hasDefaultCnameRecord } onClick={ () => {} }>
						{ __( 'Restore default CNAME record ↗' ) }
					</MenuItem>
					<MenuItem disabled={ hasDefaultEmailRecords } onClick={ () => {} }>
						{ __( 'Restore default email records ↗' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export default DnsActionsMenu;
