/**
 * External dependencies
 */
import { createSlotFill } from '@wordpress/components';
import React from 'react';

const { Fill: BlockInserterFill, Slot: BlockInserterSlot } = createSlotFill(
	'GutenboardingInserter'
);

const Inserter = BlockInserterFill;

Inserter.Slot = function() {
	return <BlockInserterSlot bubblesVirtually />;
};

export default Inserter;
