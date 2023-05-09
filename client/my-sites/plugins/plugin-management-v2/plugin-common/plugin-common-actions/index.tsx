import { Gridicon, Button } from '@automattic/components';
import { useState, useRef } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	renderActions: ( args: any ) => ReactElement;
	item: any;
}

export default function PluginCommonActions( { renderActions, item }: Props ) {
	const [ isOpen, setIsOpen ] = useState( false );

	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const showActions = () => {
		setIsOpen( true );
	};

	const closeDropdown = () => {
		setIsOpen( false );
	};

	return (
		<>
			<Button borderless compact onClick={ showActions } ref={ buttonActionRef }>
				<Gridicon icon="ellipsis" size={ 18 } className="plugin-common-actions__all-actions" />
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isOpen }
				onClose={ closeDropdown }
				position="bottom left"
			>
				{ renderActions( item ) }
			</PopoverMenu>
		</>
	);
}
