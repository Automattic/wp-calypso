import { Card, Button } from '@automattic/components';
import { Icon, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import Badge from 'calypso/components/badge';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import type {
	AllowedMonitorContactActions,
	StateMonitorSettingsSMS,
} from '../../sites-overview/types';

import '../style.scss';

interface Props {
	item: StateMonitorSettingsSMS;
	toggleModal?: ( item?: StateMonitorSettingsSMS, action?: AllowedMonitorContactActions ) => void;
	recordEvent?: ( action: string, params?: object ) => void;
	showVerifiedBadge?: boolean;
	isRemoveAction?: boolean;
}

const EVENT_NAMES = {
	edit: 'downtime_monitoring_sms_number_edit_click',
	remove: 'downtime_monitoring_sms_number_remove_click',
	verify: 'downtime_monitoring_sms_number_verify_click',
};

export default function SMSItemContent( {
	item,
	toggleModal,
	recordEvent,
	showVerifiedBadge,
	isRemoveAction = false,
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

	const handleToggleModal = ( action: AllowedMonitorContactActions ) => {
		toggleModal?.( item, action );
		if ( recordEvent ) {
			const eventName = EVENT_NAMES?.[ action as keyof typeof EVENT_NAMES ];
			recordEvent( eventName );
		}
	};

	const isVerified = item.verified;

	return (
		<Card className="configure-contact-info__card" key={ item.phoneNumberFull } compact>
			<div className="configure-contact-info__card-content-container">
				<span className="configure-contact-info__card-content">
					<div className="configure-contact-info__card-heading">{ item.phoneNumberFull }</div>
					<div className="configure-contact-info__card-sub-heading">{ item.name }</div>
				</span>
				{
					// Show the status and actions only if the action is not remove.
				 }
				{ ! isRemoveAction && (
					<>
						{ ! isVerified && (
							<span
								role="button"
								tabIndex={ 0 }
								onKeyPress={ () => handleToggleModal( 'verify' ) }
								onClick={ () => handleToggleModal( 'verify' ) }
								className="configure-contact-info__verification-status cursor-pointer"
							>
								<Badge type="warning">{ translate( 'Pending' ) }</Badge>
							</span>
						) }
						{ showVerifiedBadge && isVerified && (
							<span className="configure-contact-info__verification-status">
								<Badge type="success">{ translate( 'Verified' ) }</Badge>
							</span>
						) }
						<>
							<Button
								compact
								borderless
								className="configure-contact-info__action-icon"
								onClick={ showActions }
								aria-label={ translate( 'More actions' ) }
								ref={ buttonActionRef }
							>
								<Icon size={ 18 } icon={ moreHorizontal } />
							</Button>
							<PopoverMenu
								className="configure-contact-info__popover-menu"
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
								<PopoverMenuItem onClick={ () => handleToggleModal( 'remove' ) }>
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
