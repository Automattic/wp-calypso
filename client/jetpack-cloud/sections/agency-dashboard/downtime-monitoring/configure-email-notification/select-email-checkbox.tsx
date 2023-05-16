import { Card, Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
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
	allEmailItems: Array< StateMonitorSettingsEmail >;
	setAllEmailItems: ( emailAddresses: Array< StateMonitorSettingsEmail > ) => void;
}

export default function SelectEmailCheckbox( {
	item,
	toggleModal,
	allEmailItems,
	setAllEmailItems,
}: Props ) {
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

	const handleOnChange = ( checked: boolean ) => {
		if ( item.isDefault ) {
			return;
			// FIXME: We need to show a custom error message here or a tooltip.
		}
		if ( ! item.verified ) {
			return;
			// FIXME: We can open the verification modal here.
		}
		const updatedEmailItems = allEmailItems.map( ( emailItem ) => {
			if ( emailItem.email === item.email ) {
				return {
					...emailItem,
					checked,
				};
			}
			return emailItem;
		} );
		setAllEmailItems( updatedEmailItems );
	};

	const handleToggleModal = ( action: AllowedMonitorContactActions ) => {
		toggleModal( item, action );
	};

	const checkboxContent = (
		<div className="configure-email-address__checkbox-content-container">
			<span className="configure-email-address__checkbox-content">
				<div className="configure-email-address__checkbox-heading">{ item.email }</div>
				<div className="configure-email-address__checkbox-sub-heading">{ item.name }</div>
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
							<Badge type="warning">{ translate( 'Pending Verification' ) }</Badge>
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
	);

	return (
		<Card className="configure-email-address__card" key={ item.email } compact>
			<CheckboxControl
				className="configure-email-address__checkbox"
				checked={ item.checked }
				onChange={ handleOnChange }
				label={ checkboxContent }
			/>
		</Card>
	);
}
