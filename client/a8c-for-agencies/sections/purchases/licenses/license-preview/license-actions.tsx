import { Button, Gridicon } from '@automattic/components';
import { useState, useRef } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { LicenseAction, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import useLicenseActions from './use-license-actions';

interface Props {
	siteUrl: string | null;
	isDevSite: boolean;
	attachedAt: string | null;
	revokedAt: string | null;
	licenseType: LicenseType;
	isChildLicense?: boolean;
	isClientLicense?: boolean;
}

export default function LicenseActions( {
	siteUrl,
	isDevSite,
	attachedAt,
	revokedAt,
	licenseType,
	isChildLicense,
	isClientLicense,
}: Props ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const [ isOpen, setIsOpen ] = useState( false );

	const licenseActions = useLicenseActions(
		siteUrl,
		isDevSite,
		attachedAt,
		revokedAt,
		licenseType,
		isChildLicense,
		isClientLicense
	);

	const handleActionClick = ( action: LicenseAction ) => {
		action.onClick();
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
							onClick={ () => handleActionClick( action ) }
							href={ action?.href }
							className={ action?.className }
						>
							{ action.name }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>
		</>
	);
}
