import { Gridicon, Button } from '@automattic/components';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function CreditCardActions( {
	cardActions,
	isDisabled,
}: {
	cardActions: {
		name: string;
		isEnabled: boolean;
		onClick: () => void;
		className?: string;
	}[];
	isDisabled: boolean;
} ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const dispatch = useDispatch();

	const showActions = () => {
		setIsOpen( true );
		dispatch( recordTracksEvent( 'calypso_partner_portal_payments_card_actions_button_click' ) );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	return (
		<>
			<Button
				disabled={ isDisabled }
				borderless
				compact
				onClick={ showActions }
				ref={ buttonActionRef }
				className="stored-credit-card-v2__card-footer-actions"
			>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>
			<PopoverMenu
				className="stored-credit-card-v2__card-footer-actions-popover"
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				{ cardActions
					.filter( ( action ) => action.isEnabled )
					.map( ( action ) => (
						<PopoverMenuItem
							className={ clsx( action.className ) }
							key={ action.name }
							onClick={ action.onClick }
						>
							{ action.name }
						</PopoverMenuItem>
					) ) }
			</PopoverMenu>
		</>
	);
}
