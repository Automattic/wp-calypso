import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

import './style.scss';

export interface Action {
	id: string;
	label: string;
	icon: ReactNode;
	callback: ( items: any[] ) => void;
}

export function ListItemCardContent( {
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
} ) {
	return (
		<div className="list-item-card-content">
			<div className="list-item-card-content__header">
				<div className="list-item-card-content__header-title">{ title.toUpperCase() }</div>
			</div>
			{ children }
		</div>
	);
}

export function ListItemCardActions( { actions, item }: { actions: Action[]; item: any } ) {
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const showActions = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const closeDropdown = useCallback( () => {
		setIsOpen( false );
	}, [] );

	return (
		<div className="list-item-card-actions">
			<Button onClick={ showActions } ref={ buttonActionRef }>
				<Gridicon icon="ellipsis" size={ 18 } />
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				{ actions.map( ( action ) => (
					<PopoverMenuItem
						key={ action.id }
						onClick={ () => {
							action.callback( [ item ] );
						} }
					>
						{ action.label }
					</PopoverMenuItem>
				) ) }
			</PopoverMenu>
		</div>
	);
}

export function ListItemCard( { children }: { children: React.ReactNode } ) {
	return <div className="list-item-card">{ children }</div>;
}

export function ListItemCards( { children }: { children: React.ReactNode } ) {
	return <div className="list-item-cards">{ children }</div>;
}
