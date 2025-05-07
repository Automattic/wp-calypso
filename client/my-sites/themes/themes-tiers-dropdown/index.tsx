import { Button, Dropdown, MenuGroup, MenuItem } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import './style.scss';

interface ThemesTiersDropdownProps {
	tiers: { value: string; label: string }[];
	selectedTier: string;
	buttonText: string;
	onSelect: ( item: { value: string; label: string } ) => void;
}

const ThemesTiersDropdown = ( {
	tiers,
	selectedTier,
	buttonText,
	onSelect,
}: ThemesTiersDropdownProps ) => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	return (
		<Dropdown
			className="section-nav-tabs__dropdown"
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					size="compact"
					variant="secondary"
					icon={ chevronDown }
					iconPosition="right"
					aria-expanded={ isOpen }
					onClick={ onToggle }
				>
					{ buttonText }
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<MenuGroup>
					{ tiers.map( ( item ) => (
						<MenuItem
							key={ item.value }
							role="menuitemradio"
							isSelected={ item.value === selectedTier }
							onClick={ () => {
								onSelect( item );
								onClose();
							} }
						>
							{ item.label }
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
		/>
	);
};

export default ThemesTiersDropdown;
