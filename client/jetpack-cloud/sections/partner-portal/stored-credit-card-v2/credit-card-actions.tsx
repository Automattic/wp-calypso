import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

export default function CreditCardActions( {
	cardActions,
}: {
	cardActions: {
		name: string;
		isEnabled: boolean;
		onClick: () => void;
		className?: string;
	}[];
} ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	return (
		<>
			<Button
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
							className={ classNames( action.className ) }
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
