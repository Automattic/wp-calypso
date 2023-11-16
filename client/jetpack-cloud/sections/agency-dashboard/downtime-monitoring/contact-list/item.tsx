import { Badge, Card, Button } from '@automattic/components';
import { Icon, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useContext, useCallback } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import { getContactActionEventName, getContactItemValue } from './utils';
import type {
	AllowedMonitorContactActions,
	AllowedMonitorContactTypes,
	StateMonitorSettingsEmail,
	StateMonitoringSettingsContact,
} from '../../sites-overview/types';

import './style.scss';

type Props = {
	item: StateMonitoringSettingsContact;
	onAction?: ( item: StateMonitoringSettingsContact, action: AllowedMonitorContactActions ) => void;
	recordEvent?: ( action: string, params?: object ) => void;
	showVerifiedBadge?: boolean;
	type: AllowedMonitorContactTypes;
};

export default function ContactListItem( {
	item,
	onAction,
	recordEvent,
	showVerifiedBadge,
	type,
}: Props ) {
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = () => {
		setIsOpen( ! isOpen );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	const { verifiedContacts } = useContext( DashboardDataContext );

	const value = getContactItemValue( type, item );
	const name = item.name;

	const hasActionHandler = !! onAction;

	const isVerified =
		item.verified ||
		( type === 'email' && value && verifiedContacts?.emails.includes( value ) ) ||
		( type === 'sms' && value && verifiedContacts?.phoneNumbers.includes( value ) );

	const isDefaultItem = type === 'email' && ( item as StateMonitorSettingsEmail ).isDefault;

	const handleOnAction = useCallback(
		( action: AllowedMonitorContactActions ) => {
			onAction?.( item, action );
			if ( recordEvent ) {
				recordEvent( getContactActionEventName( type, action ) );
			}
		},
		[ onAction, recordEvent, type, item ]
	);

	return (
		<Card className="contact-list-item" key={ value } compact>
			<div className="contact-list-item__content-container">
				<span className="contact-list-item__content">
					<div className="contact-list-item__heading">{ value }</div>
					<div className="contact-list-item__sub-heading">{ name }</div>
				</span>
				{ hasActionHandler && ! isDefaultItem && (
					<>
						{ ! isVerified && (
							<span
								role="button"
								tabIndex={ 0 }
								onKeyPress={ () => handleOnAction( 'verify' ) }
								onClick={ () => handleOnAction( 'verify' ) }
								className="contact-list-item__verification-status cursor-pointer"
							>
								<Badge type="warning">{ translate( 'Pending' ) }</Badge>
							</span>
						) }
						{ showVerifiedBadge && isVerified && (
							<span className="contact-list-item__verification-status">
								<Badge type="success">{ translate( 'Verified' ) }</Badge>
							</span>
						) }
						<>
							<Button
								compact
								borderless
								className="contact-list-item__action-icon"
								onClick={ showActions }
								aria-label={ translate( 'More actions' ) }
								ref={ buttonActionRef }
							>
								<Icon size={ 18 } icon={ moreHorizontal } />
							</Button>
							<PopoverMenu
								className="contact-list-item__popover-menu"
								context={ buttonActionRef.current }
								isVisible={ isOpen }
								onClose={ closeDropdown }
								position="bottom left"
							>
								{ ! item.verified && (
									<PopoverMenuItem onClick={ () => handleOnAction( 'verify' ) }>
										{ translate( 'Verify' ) }
									</PopoverMenuItem>
								) }
								<PopoverMenuItem onClick={ () => handleOnAction( 'edit' ) }>
									{ translate( 'Edit' ) }
								</PopoverMenuItem>
								<PopoverMenuItem onClick={ () => handleOnAction( 'remove' ) }>
									{ translate( 'Remove' ) }
								</PopoverMenuItem>
							</PopoverMenu>
						</>
					</>
				) }
			</div>
		</Card>
	);
}
