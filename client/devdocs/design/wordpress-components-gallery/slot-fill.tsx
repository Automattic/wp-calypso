import { Fill, Slot, SlotFillProvider } from '@wordpress/components';

const SlotFillExample = () => (
	<SlotFillProvider>
		<h2>Profile</h2>
		<p>
			Name: <Slot bubblesVirtually name="name" />
		</p>
		<p>
			Age: <Slot bubblesVirtually name="age" />
		</p>
		<Fill name="name">Grace</Fill>
		<Fill name="age">33</Fill>
	</SlotFillProvider>
);

export default SlotFillExample;
