import { Button } from '@automattic/components';
import { Icon, check, chevronDown } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type Props = {
	label: string;
	options: { key: string; label: string }[];
	selectedOptions: { [ key: string ]: boolean };
	onOptionClick?: ( option: string ) => void;
};

export function ProductFilterSelect( { label, options, selectedOptions, onOptionClick }: Props ) {
	const buttonRef = useRef< HTMLButtonElement | null >( null );

	const [ openDropdown, setOpenDropdown ] = useState< boolean >( false );

	const selectedOptionsCount = Object.values( selectedOptions ).filter(
		( isSelected ) => isSelected
	).length;

	const buttonText = translate( '%(filterLabel)s (%(filterCount)d)', {
		args: {
			filterLabel: label,
			filterCount: selectedOptionsCount,
		},
		comment:
			'%(filterLabel)s is the filter label and %(filterCount)d is the number of selected filters',
	} );

	return (
		<>
			<Button
				ref={ buttonRef }
				className="product-filter-button"
				plain
				onClick={ () => setOpenDropdown( true ) }
			>
				{ buttonText } <Icon icon={ chevronDown } />
			</Button>

			<PopoverMenu
				context={ buttonRef.current }
				isVisible={ openDropdown }
				onClose={ () => setOpenDropdown( false ) }
				position="bottom right"
			>
				{ options.map( ( option ) => (
					<PopoverMenuItem key={ option.key } onClick={ () => onOptionClick?.( option.key ) }>
						<Icon
							className="gridicon"
							icon={ check }
							style={ { visibility: selectedOptions[ option.key ] ? 'visible' : 'hidden' } } // We need to hide the check icon but still keep the space for it
						/>
						{ option.label }
					</PopoverMenuItem>
				) ) }
			</PopoverMenu>
		</>
	);
}
