import { Gridicon, Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

export default function LicenseBundleDropDown() {
	const [ showRevokeDialog, setShowRevokeDialog ] = useState( false );
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const onShowRevokeDialog = useCallback( () => {
		setShowRevokeDialog( true );
	}, [] );

	const onHideRevokeDialog = useCallback( () => {
		setShowRevokeDialog( false );
	}, [] );

	const onRevokeLicense = useCallback( () => {}, [] );

	return (
		<>
			<Button
				className="license-bundle-dropdown__button"
				borderless
				compact
				onClick={ onShowRevokeDialog }
				ref={ buttonActionRef }
			>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>

			<PopoverMenu
				className="license-bundle-dropdown__popover-menu"
				context={ buttonActionRef.current }
				isVisible={ showRevokeDialog }
				onClose={ onHideRevokeDialog }
				position="bottom left"
			>
				<span className="license-bundle-dropdown__popover-menu-title">
					{ translate( 'Option' ) }
				</span>

				<PopoverMenuItem
					onClick={ onRevokeLicense }
					className="license-bundle-dropdown__popover-menu-item-revoke"
				>
					{ translate( 'Revoke bundle' ) } <Gridicon icon="trash" size={ 18 } />
				</PopoverMenuItem>
			</PopoverMenu>
		</>
	);
}
