import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useState, useRef } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import RevokeLicenseDialog from '../revoke-license-dialog';
import useLicenseActions from './use-license-actions';
import type { LicenceAction, LicenseType } from '../types';

interface Props {
	licenseKey: string;
	product: string;
	siteUrl: string | null;
	attachedAt: string | null;
	revokedAt: string | null;
	licenseType: LicenseType;
}

export default function LicenseActions( {
	siteUrl,
	licenseKey,
	product,
	attachedAt,
	revokedAt,
	licenseType,
}: Props ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const [ isOpen, setIsOpen ] = useState( false );
	const [ openModal, setOpenModal ] = useState< string | null >( null );

	const licenseActions = useLicenseActions( siteUrl, attachedAt, revokedAt, licenseType );

	const handleActionClick = ( action: LicenceAction ) => {
		action.onClick();
		action.openModal && setOpenModal( action.openModal );
	};

	return (
		<>
			<Button borderless compact onClick={ () => setIsOpen( true ) } ref={ buttonActionRef }>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>
			<PopoverMenu
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
							className={ classnames( 'license-actions__menu-item', action?.className ) }
						>
							{ action.name }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>

			{ openModal === 'revoke-license' && (
				<RevokeLicenseDialog
					licenseKey={ licenseKey }
					product={ product }
					siteUrl={ siteUrl }
					onClose={ () => setOpenModal( null ) }
				/>
			) }
		</>
	);
}
