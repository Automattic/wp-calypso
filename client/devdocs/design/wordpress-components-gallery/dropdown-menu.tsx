/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { Fragment } from '@wordpress/element';
import { DropdownMenu, MenuGroup, MenuItem, MenuItemsChoice } from '@wordpress/components';
import { more, arrowUp, arrowDown, trash } from '@wordpress/icons';

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
						/>
					</MenuGroup>
				</Fragment>
			) }
		</DropdownMenu>
	);
};

export default DropdownMenuExample;
