import { Card, Button } from '@automattic/components';
import { Icon, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import Badge from 'calypso/components/badge';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import type { StateMonitorSettingsSMS } from '../../sites-overview/types';

import '../style.scss';

interface Props {
	item: StateMonitorSettingsSMS;
}

// events actions have not yet been implemented, silencing this warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EVENT_NAMES = {
	edit: 'downtime_monitoring_sms_number_edit_click',
	remove: 'downtime_monitoring_sms_number_remove_click',
	verify: 'downtime_monitoring_sms_number_verify_click',
};

export default function SMSItemContent( { item }: Props ) {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = () => {
		setIsOpen( ! isOpen );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	// silencing error until action handling is added
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleToggleModal = () => {
		// Here you can handle actions
		return null;
	};

	const isVerified = item.verified;

	return (
		<Card className="configure-contact-info__card" key={ item.phoneNumberFull } compact>
			<div className="configure-contact-info__card-content-container">
				<span className="configure-contact-info__card-content">
					<div className="configure-contact-info__card-heading">{ item.phoneNumberFull }</div>
					<div className="configure-contact-info__card-sub-heading">{ item.name }</div>
				</span>

				{ ! isVerified && (
					<span
						role="button"
						tabIndex={ 0 }
						onKeyPress={ () => {
							//TODO add verification handling
							return null;
						} }
						onClick={ () => {
							//TODO add verification handling
							return null;
						} }
						className="configure-contact-info__verification-status cursor-pointer"
					>
						<Badge type="warning">{ translate( 'Pending' ) }</Badge>
					</span>
				) }
				{ isVerified && (
					<span className="configure-contact-info__verification-status">
						<Badge type="success">{ translate( 'Verified' ) }</Badge>
					</span>
				) }
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
					<PopoverMenuItem
						onClick={ () => {
							//TODO handle actions
							return null;
						} }
					>
						{ translate( 'Verify' ) }
					</PopoverMenuItem>

					<PopoverMenuItem
						onClick={ () => {
							//TODO handle actions
							return null;
						} }
					>
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
					<PopoverMenuItem
						onClick={ () => {
							//TODO handle actions
							return null;
						} }
					>
						{ translate( 'Remove' ) }
					</PopoverMenuItem>
				</PopoverMenu>
			</div>
		</Card>
	);
}
