import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

export default function CSVColumnConfirmation( {
	columns,
	onColumnSelect,
	column,
}: {
	columns: string[];
	onColumnSelect: ( option: string ) => void;
	column: string;
} ) {
	const translate = useTranslate();
	const [ isColumnsMenuOpen, setIsColumnsMenuOpen ] = useState( false );
	const buttonActionRef = useRef< HTMLButtonElement | null >( null );

	const columnItems = columns.map( ( c, index ) => {
		return (
			<PopoverMenuItem key={ index } onClick={ () => onColumnSelect( c ) }>
				<Gridicon icon={ c === column ? 'checkmark' : 'none' } size={ 12 } />
				{ c }
			</PopoverMenuItem>
		);
	} );

	const showColumns = () => {
		setIsColumnsMenuOpen( true );
	};

	const closeDropdown = () => {
		setIsColumnsMenuOpen( false );
	};

	return (
		<div className="connect-url-csv-column-confirmation">
			<Button ref={ buttonActionRef } onClick={ showColumns }>
				{ translate( 'Choose column' ) }
			</Button>
			<PopoverMenu
				context={ buttonActionRef.current }
				isVisible={ isColumnsMenuOpen }
				onClose={ closeDropdown }
				position="bottom"
			>
				{ columnItems }
			</PopoverMenu>
		</div>
	);
}
