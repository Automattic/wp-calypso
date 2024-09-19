import { SubmenuPopover, useSubmenuPopoverProps } from '@automattic/components';
import { MenuGroup, MenuItem } from '@wordpress/components';
import { Icon, chevronRight, check } from '@wordpress/icons';

type Props = {
	label: string;
	options: { key: string; label: string }[];
	selectedOptions: { [ key: string ]: boolean };
	onOptionClick?: ( option: string ) => void;
};

export function ProductFilterItem( { label, options, selectedOptions, onOptionClick }: Props ) {
	const submenu = useSubmenuPopoverProps< HTMLDivElement >( {
		flip: false,
	} );

	return (
		<div { ...submenu.parent }>
			<MenuItem icon={ chevronRight }>{ label }</MenuItem>
			<SubmenuPopover { ...submenu.submenu } className="components-popover is-product-filter">
				<MenuGroup className="product-filter__group">
					{ options.map( ( option ) => (
						<MenuItem key={ option.key } onClick={ () => onOptionClick?.( option.key ) }>
							<Icon
								icon={ check }
								style={ { visibility: selectedOptions[ option.key ] ? 'visible' : 'hidden' } } // We need to hide the check icon but still keep the space for it
							/>
							{ option.label }
						</MenuItem>
					) ) }
				</MenuGroup>
			</SubmenuPopover>
		</div>
	);
}
