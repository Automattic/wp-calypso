import { domainDnsImportBindMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { DropdownMenu, FormFileUpload, MenuGroup, MenuItem } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import type { DnsRecord } from '@automattic/api-core';

interface DnsActionsMenuProps {
	domainName: string;
	hasDefaultARecords: boolean;
	hasDefaultCnameRecord: boolean;
	hasDefaultEmailRecords: boolean;
	onRecordsImported: ( data: DnsRecord[] ) => void;
	onRestoreDefaultARecords: () => void;
	onRestoreDefaultCnameRecord: () => void;
	onRestoreDefaultEmailRecords: () => void;
}

const DnsActionsMenu = ( {
	domainName,
	hasDefaultARecords,
	hasDefaultCnameRecord,
	hasDefaultEmailRecords,
	onRecordsImported,
	onRestoreDefaultARecords,
	onRestoreDefaultCnameRecord,
	onRestoreDefaultEmailRecords,
}: DnsActionsMenuProps ) => {
	const { createErrorNotice } = useDispatch( noticesStore );
	const importDnsBindMutation = useMutation( domainDnsImportBindMutation( domainName ) );

	const handleFileChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const file = event.currentTarget.files?.[ 0 ];
		if ( ! file ) {
			return;
		}

		importDnsBindMutation.mutate( file, {
			onSuccess: ( data ) => {
				onRecordsImported( data );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to import DNS records.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'DNS actions' ) }>
			{ ( { onClose } ) => (
				<MenuGroup className="dashboard-domains-overview-dns-actions-menu__menu-group">
					<FormFileUpload
						accept="text/plain"
						multiple={ false }
						onChange={ ( event ) => {
							onClose();
							handleFileChange( event );
						} }
						render={ ( { openFileDialog } ) => (
							<MenuItem onClick={ openFileDialog } disabled={ importDnsBindMutation.isPending }>
								{ __( 'Import BIND file' ) }
							</MenuItem>
						) }
					/>
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
