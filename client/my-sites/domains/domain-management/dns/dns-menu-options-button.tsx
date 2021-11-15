/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { Icon, moreVertical, redo } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import wpcom from 'calypso/lib/wp';
import './dns-breadcrumb-button.scss';
import RestoreDefaultARecordsDialog from './restore-default-a-records-dialog';
import { DnsMenuOptionsButtonProps, RestoreDialogResult } from './types';

function DnsMenuOptionsButton( {
	domain,
	pointsToWpcom,
	onSuccess,
	onError,
}: DnsMenuOptionsButtonProps ): JSX.Element {
	const { __ } = useI18n();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ isRestoreDialogVisible, setRestoreDialogVisible ] = useState( false );
	const optionsButtonRef = useRef( null );
	const restoreRecordsErrorMessage = __(
		'An unexpected error occurred when trying to restore your DNS records. Please try again later.'
	);

	const toggleMenu = useCallback( () => {
		setMenuVisible( ! isMenuVisible );
	}, [ isMenuVisible ] );

	const closeMenu = useCallback( () => setMenuVisible( false ), [] );

	const restoreDefaultRecords = useCallback( async () => {
		const wpcomDomain = wpcom.domain( domain );

		try {
			const restoreResult = await wpcomDomain.dns().restoreDefaultRecords();

			if ( restoreResult.success ) {
				onSuccess( restoreResult.records );
			} else {
				onError( restoreRecordsErrorMessage );
			}
		} catch {
			onError( restoreRecordsErrorMessage );
		}
	}, [ domain, onError, onSuccess, restoreRecordsErrorMessage ] );

	const closeRestoreDialog = ( result: RestoreDialogResult ) => {
		setRestoreDialogVisible( false );
		if ( result?.shouldRestoreDefaultRecords ?? false ) {
			restoreDefaultRecords();
		}
	};

	const showRestoreDialog = useCallback( () => setRestoreDialogVisible( true ), [] );

	return (
		<>
			<RestoreDefaultARecordsDialog
				visible={ isRestoreDialogVisible }
				onClose={ closeRestoreDialog }
				defaultRecords={ null }
			/>
			<Button
				className="dns__breadcrumb-button ellipsis"
				onClick={ toggleMenu }
				ref={ optionsButtonRef }
			>
				<Icon icon={ moreVertical } className="gridicon" />
			</Button>
			<PopoverMenu
				className="dns__breadcrumb-button popover"
				isVisible={ isMenuVisible }
				onClose={ closeMenu }
				context={ optionsButtonRef.current }
				position="bottom"
			>
				<PopoverMenuItem onClick={ showRestoreDialog } disabled={ pointsToWpcom }>
					<Icon icon={ redo } size={ 14 } className="gridicon" viewBox="2 2 20 20" />
					{ __( 'Restore default A records' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
}

export default DnsMenuOptionsButton;
