import { DropdownMenu, MenuGroup, MenuItem, MenuItemsChoice } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { more, arrowUp, arrowDown, trash } from '@wordpress/icons';
import { useState } from 'react';

const DropdownMenuExample = () => {
	const [ mode, setMode ] = useState( 'visual' );
	return (
		<DropdownMenu icon={ more } label="Select a direction">
			{ ( { onClose } ) => (
				<Fragment>
					<MenuGroup label="Directions">
						<MenuItem icon={ arrowUp } onClick={ onClose }>
							Move Up
						</MenuItem>
						<MenuItem icon={ arrowDown } onClick={ onClose }>
							Move Down
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem icon={ trash } onClick={ onClose }>
							Remove
						</MenuItem>
					</MenuGroup>
					<MenuGroup label="Editor">
						<MenuItemsChoice
							choices={ [
								{
									value: 'visual',
									label: 'Visual editor',
								},
								{
									value: 'text',
									label: 'Code editor',
								},
							] }
							value={ mode }
							onSelect={ setMode }
							onHover={ () => undefined }
						/>
					</MenuGroup>
				</Fragment>
			) }
		</DropdownMenu>
	);
};

export default DropdownMenuExample;
