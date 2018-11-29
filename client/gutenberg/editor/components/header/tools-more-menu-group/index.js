/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill: ToolsMoreMenuGroup, Slot } = createSlotFill( 'ToolsMoreMenuGroup' );

ToolsMoreMenuGroup.Slot = ( { fillProps } ) => (
	<Slot fillProps={ fillProps }>{ fills => ! isEmpty( fills ) && { fills } }</Slot>
);

export default ToolsMoreMenuGroup;
