import { Button, Gridicon } from '@automattic/components';
import { useState, useRef, ReactNode } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { LicenseAction, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useLicenseActions, { LicenseActionType } from './use-license-actions';
import type { License } from 'calypso/state/partner-portal/types';

interface Props {
	type: LicenseActionType;
	license: License;
	licenseType: LicenseType;
	isDevSite: boolean;
	isChildLicense?: boolean;
	isClientLicense?: boolean;
	productName: string;
	licenseKey: string;
	productId: number;
	bundleSize: number;
}

export default function LicenseActions( {
	type,
	license,
	licenseType,
	isDevSite,
	isChildLicense,
	isClientLicense,
	productName,
	productId,
	bundleSize,
}: Props ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const [ isOpen, setIsOpen ] = useState( false );

	const [ currentDialog, setCurrentDialog ] = useState< ReactNode >( null );

	const licenseActions = useLicenseActions( {
		siteUrl: license.siteUrl,
		isDevSite,
		attachedAt: license.attachedAt,
		revokedAt: license.revokedAt,
		licenseType,
		isChildLicense,
		isClientLicense,
		type,
		productName,
		licenseKey: license.licenseKey,
		bundleSize,
		productId,
	} );

	const handleActionClick = ( action: LicenseAction ) => {
		if ( action.dialog ) {
			setCurrentDialog( action.dialog( { onClose: () => setCurrentDialog( null ) } ) );
		}

		action.onClick();
	};

	const availableActions = licenseActions.filter( ( action ) => action.isEnabled );

	if ( availableActions.length === 0 ) {
		return null;
	}

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
				{ availableActions.map( ( action ) => (
					<>
						<PopoverMenuItem
							key={ action.name }
							isExternalLink={ action?.isExternalLink }
							onClick={ () => handleActionClick( action ) }
							href={ action?.href }
							className={ action?.className }
						>
							{ action.name }
						</PopoverMenuItem>
					</>
				) ) }
			</PopoverMenu>

			{ currentDialog }
		</>
	);
}
