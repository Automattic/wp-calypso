import { Card, Button } from '@automattic/components';
import { Icon, moreHorizontal } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useContext } from 'react';
import Badge from 'calypso/components/badge';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import type {
	StateMonitorSettingsEmail,
	AllowedMonitorContactActions,
} from '../../sites-overview/types';

interface Props {
	item: StateMonitorSettingsEmail;
	toggleModal?: ( item?: StateMonitorSettingsEmail, action?: AllowedMonitorContactActions ) => void;
	isRemoveAction?: boolean;
	recordEvent?: ( action: string, params?: object ) => void;
	showVerifiedBadge?: boolean;
}

const EVENT_NAMES = {
	edit: 'downtime_monitoring_email_address_edit_click',
	remove: 'downtime_monitoring_email_address_remove_click',
	verify: 'downtime_monitoring_email_address_verify_click',
};

export default function EmailItemContent( {
	item,
	toggleModal,
	isRemoveAction = false,
	recordEvent,
	showVerifiedBadge,
}: Props ) {
	const translate = useTranslate();

	const [ isOpen, setIsOpen ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const { verifiedContacts } = useContext( DashboardDataContext );

	const showActions = () => {
		setIsOpen( true );
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

	const isVerified = item.verified || verifiedContacts.emails.includes( item.email );

	return (
		<Card className="configure-email-address__card" key={ item.email } compact>
			<div className="configure-email-address__card-content-container">
				<span className="configure-email-address__card-content">
					<div className="configure-email-address__card-heading">{ item.email }</div>
					<div className="configure-email-address__card-sub-heading">{ item.name }</div>
				</span>
				{
					// Show the status and actions only if the action is not remove.
				 }
				{ ! item.isDefault && ! isRemoveAction && (
					<>
						{ ! isVerified && (
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
						{ showVerifiedBadge && isVerified && (
							<span className="configure-email-address__verification-status">
								<Badge type="success">{ translate( 'Verified' ) }</Badge>
							</span>
						) }
						<>
							<Button
								compact
								borderless
								className="configure-email-address__action-icon"
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
								{ ! item.verified && (
									<PopoverMenuItem onClick={ () => handleToggleModal( 'verify' ) }>
										{ translate( 'Verify' ) }
									</PopoverMenuItem>
								) }
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
