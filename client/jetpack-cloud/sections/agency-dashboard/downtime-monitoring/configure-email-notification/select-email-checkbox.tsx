import { Card, Button } from '@automattic/components';
import { Icon, pencil, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import Badge from 'calypso/components/badge';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import type {
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

interface Props {
	item: StateMonitorSettingsEmail;
	toggleModal: ( item?: StateMonitorSettingsEmail, action?: AllowedMonitorContactActions ) => void;
}

export default function SelectEmailCheckbox( { item, toggleModal }: Props ) {
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const showVerified = true; // FIXME: This should be dynamic.

	const handleToggleModal = ( action: AllowedMonitorContactActions ) => {
		toggleModal( item, action );
	};

	return (
		<Card className="configure-email-address__card" key={ item.email } compact>
			<div className="configure-email-address__card-content-container">
				<span className="configure-email-address__card-content">
					<div className="configure-email-address__card-heading">{ item.email }</div>
					<div className="configure-email-address__card-sub-heading">{ item.name }</div>
				</span>
				{ ! item.isDefault && (
					<>
						{ ! item.verified && (
							<span
								role="button"
								tabIndex={ 0 }
								onKeyPress={ () => handleToggleModal( 'verify' ) }
								onClick={ () => handleToggleModal( 'verify' ) }
								className="configure-email-address__verification-status cursor-pointer"
							>
								<Badge type="warning">{ translate( 'Pending' ) }</Badge>
							</span>
						) }
						{ showVerified && item.verified && (
							<span className="configure-email-address__verification-status">
								<Badge type="success">{ translate( 'Verified' ) }</Badge>
							</span>
						) }
						{ item.verified ? (
							<Button
								compact
								borderless
								className="configure-email-address__edit-icon"
								onClick={ () => handleToggleModal( 'edit' ) }
								aria-label={ translate( 'Edit email address' ) }
							>
								<Icon size={ 18 } icon={ pencil } />
							</Button>
						) : (
							<>
								<Button
									compact
									borderless
									className="configure-email-address__edit-icon"
									onClick={ showActions }
									aria-label={ translate( 'More actions' ) }
									ref={ buttonActionRef }
								>
									<Icon size={ 18 } icon={ moreHorizontal } />
								</Button>
								<PopoverMenu
									className="configure-email-address__popover-menu"
									context={ buttonActionRef.current }
									isVisible={ isOpen }
									onClose={ closeDropdown }
									position="bottom left"
								>
									<PopoverMenuItem onClick={ () => handleToggleModal( 'verify' ) }>
										{ translate( 'Verify' ) }
									</PopoverMenuItem>
									<PopoverMenuItem onClick={ () => handleToggleModal( 'edit' ) }>
										{ translate( 'Edit' ) }
									</PopoverMenuItem>
								</PopoverMenu>
							</>
						) }
					</>
				) }
			</div>
		</Card>
	);
}
