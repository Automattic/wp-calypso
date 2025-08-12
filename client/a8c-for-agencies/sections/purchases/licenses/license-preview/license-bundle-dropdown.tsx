import { Gridicon, Button } from '@automattic/components';
import { Icon, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import CancelLicenseFeedbackModal from 'calypso/a8c-for-agencies/components/a4a-feedback/churn-mechanism/cancel-license-feedback-modal';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch, useSelector } from 'calypso/state';
import { hasAgencyCapability } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { A4AStore } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

type Props = {
	licenseKey: string;
	productName: string;
	bundleSize: number;
	productId: number;
	isClientLicense: boolean;
};

export default function LicenseBundleDropDown( {
	licenseKey,
	productName,
	bundleSize,
	productId,
	isClientLicense,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const canRevoke = useSelector( ( state: A4AStore ) =>
		hasAgencyCapability( state, 'a4a_revoke_licenses' )
	);

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

	if ( ! canRevoke ) {
		return null;
	}

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
				className="license-actions__menu"
				context={ buttonActionRef.current }
				isVisible={ showContextMenu }
				onClose={ onHideContextMenu }
				position="bottom left"
				focusOnShow={ false }
			>
				<PopoverMenuItem onClick={ onShowRevokeDialog } className="is-destructive">
					{ translate( 'Revoke bundle' ) } <Icon className="gridicon" icon={ trash } size={ 24 } />
				</PopoverMenuItem>
			</PopoverMenu>

			{ showRevokeDialog && (
				<CancelLicenseFeedbackModal
					onClose={ onHideRevokeDialog }
					productName={ productName }
					licenseKey={ licenseKey }
					productId={ productId }
					bundleSize={ bundleSize }
					isClientLicense={ isClientLicense }
				/>
			) }
		</>
	);
}
