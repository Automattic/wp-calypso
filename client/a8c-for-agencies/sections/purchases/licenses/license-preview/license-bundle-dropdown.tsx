import { Gridicon, Button } from '@automattic/components';
import { Icon, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import RevokeLicenseDialog from 'calypso/jetpack-cloud/sections/partner-portal/revoke-license-dialog';
import { LicenseRole } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	licenseKey: string;
	product: string;
	bundleSize: number;
};

export default function LicenseBundleDropDown( { licenseKey, product, bundleSize }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showRevokeDialog, setShowRevokeDialog ] = useState( false );
	const [ showContextMenu, setShowContextMenu ] = useState( false );
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const onShowContextMenu = useCallback( () => {
		setShowContextMenu( true );
	}, [] );

	const onHideContextMenu = useCallback( () => {
		setShowContextMenu( false );
	}, [] );

	const onShowRevokeDialog = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_revoke_bundle_dialog_open' ) );
		setShowRevokeDialog( true );
	}, [ dispatch ] );

	const onHideRevokeDialog = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_license_list_revoke_bundle_dialog_close' ) );
		setShowRevokeDialog( false );
	}, [ dispatch ] );

	return (
		<>
			<Button
				className="license-bundle-dropdown__button"
				borderless
				compact
				onClick={ onShowContextMenu }
				ref={ buttonActionRef }
			>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>

			<PopoverMenu
				className="license-bundle-dropdown__popover-menu"
				context={ buttonActionRef.current }
				isVisible={ showContextMenu }
				onClose={ onHideContextMenu }
				position="bottom left"
				focusOnShow={ false }
			>
				<PopoverMenuItem
					onClick={ onShowRevokeDialog }
					className="license-bundle-dropdown__popover-menu-item-revoke"
				>
					{ translate( 'Revoke bundle' ) } <Icon className="gridicon" icon={ trash } size={ 24 } />
				</PopoverMenuItem>
			</PopoverMenu>

			{ showRevokeDialog && (
				<RevokeLicenseDialog
					licenseRole={ LicenseRole.Parent }
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ null }
					onClose={ onHideRevokeDialog }
					bundleSize={ bundleSize }
				/>
			) }
		</>
	);
}
