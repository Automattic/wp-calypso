import { Fill, Slot, SlotFillProvider } from '@wordpress/components';
import React from 'react';

const SlotFillExample = () => (
	<SlotFillProvider>
		<h2>Profile</h2>
		<p>
			Name: <Slot bubblesVirtually as="span" name="name" />
		</p>
		<p>
			Age: <Slot bubblesVirtually as="span" name="age" />
		</p>
		<Fill name="name">Grace</Fill>
		<Fill name="age">33</Fill>
	</SlotFillProvider>
);

export default SlotFillExample;
