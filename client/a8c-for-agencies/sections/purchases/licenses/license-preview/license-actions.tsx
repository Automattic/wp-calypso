import { Button, Gridicon } from '@automattic/components';
import { Modal } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import CancelLicenseFeedbackModal from 'calypso/a8c-for-agencies/components/a4a-feedback/churn-mechanism/cancel-license-feedback-modal';
import LaunchPermissionModal from 'calypso/a8c-for-agencies/components/launch-permission-modal';
import useWPAdminAccessControl from 'calypso/a8c-for-agencies/hooks/use-wp-admin-access-control';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { LicenseAction, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useLicenseActions from './use-license-actions';

interface Props {
	siteUrl: string | null;
	blogId?: number | null;
	isDevSite: boolean;
	attachedAt: string | null;
	revokedAt: string | null;
	licenseType: LicenseType;
	isChildLicense?: boolean;
	isClientLicense?: boolean;
	productName: string;
	licenseKey: string;
	productId: number;
}

export default function LicenseActions( {
	siteUrl,
	blogId,
	isDevSite,
	attachedAt,
	revokedAt,
	licenseType,
	isChildLicense,
	isClientLicense,
	productName,
	licenseKey,
	productId,
}: Props ) {
	const translate = useTranslate();
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const [ isOpen, setIsOpen ] = useState( false );
	const [ showRevokeDialog, setShowRevokeDialog ] = useState( false );
	const [ showLaunchPermissionModal, setShowLaunchPermissionModal ] = useState( false );

	const { noWPAdminAccess } = useWPAdminAccessControl( { siteId: blogId ?? 0 } );
	// Only block launching when we have a valid site to check access against.
	const cannotLaunch = !! blogId && noWPAdminAccess;

	const licenseActions = useLicenseActions(
		siteUrl,
		isDevSite,
		attachedAt,
		revokedAt,
		licenseType,
		isChildLicense,
		isClientLicense,
		cannotLaunch
	);

	const handleActionClick = ( action: LicenseAction ) => {
		action.onClick();
		if ( action.type === 'revoke' ) {
			setShowRevokeDialog( true );
		}
		if ( action.type === 'launch_permission' ) {
			setShowLaunchPermissionModal( true );
		}
	};

	return (
		<>
			<Button borderless compact onClick={ () => setIsOpen( true ) } ref={ buttonActionRef }>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>
			<PopoverMenu
				className="license-actions__menu"
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ () => setIsOpen( false ) }
				position="bottom left"
			>
				{ licenseActions
					.filter( ( action ) => action.isEnabled )
					.map( ( action ) => (
						<PopoverMenuItem
							key={ action.name }
							isExternalLink={ action?.isExternalLink }
							localizeUrl={ false }
							onClick={ () => handleActionClick( action ) }
							href={ action?.href }
							className={ action?.className }
						>
							{ action.name }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>
			{ showLaunchPermissionModal && (
				<Modal
					title={ translate( 'Launching requires site admin access' ) }
					size="medium"
					onRequestClose={ () => setShowLaunchPermissionModal( false ) }
				>
					<LaunchPermissionModal
						source="licenses"
						onClose={ () => setShowLaunchPermissionModal( false ) }
					/>
				</Modal>
			) }
			{ showRevokeDialog && (
				<CancelLicenseFeedbackModal
					isAtomicSite
					onClose={ () => setShowRevokeDialog( false ) }
					productName={ productName }
					licenseKey={ licenseKey }
					siteUrl={ siteUrl }
					productId={ productId }
					isClientLicense={ isClientLicense }
					isChildLicense={ isChildLicense }
				/>
			) }
		</>
	);
}
