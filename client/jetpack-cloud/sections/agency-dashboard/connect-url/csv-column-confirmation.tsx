import { Button } from '@automattic/components';
import { Icon, chevronDown } from '@wordpress/icons';
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
				{ c }
			</PopoverMenuItem>
		);
	} );

	const openDropdown = () => {
		setIsColumnsMenuOpen( true );
	};

	const closeDropdown = () => {
		setIsColumnsMenuOpen( false );
	};

	return (
		<div className="connect-url-csv-column-confirmation">
			<Button
				ref={ buttonActionRef }
				onClick={ openDropdown }
				className="connect-url-csv-column-confirmation__column-picker"
			>
				{ column ? (
					// Translators: %(column)s is a column name from a CSV file that is uploaded by the user.
					translate( 'Column: %(column)s', { args: { column } } )
				) : (
					<>
						{ translate( 'Choose URL column' ) }
						<Icon icon={ chevronDown } />
					</>
				) }
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
