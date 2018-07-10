/**
 * Internal dependencies
 */
import Slot from './slot';
import Fill from './fill';
import Provider from './provider';

export { Slot };
export { Fill };
export { Provider };

export function createSlotFill( name ) {
	const FillComponent = ( { children, ...props } ) => (
		<Fill name={ name } { ...props }>
			{ children }
		</Fill>
	);
	FillComponent.displayName = name + 'Fill';

	const SlotComponent = ( { children, ...props } ) => (
		<Slot name={ name } { ...props }>
			{ children }
		</Slot>
	);
	SlotComponent.displayName = name + 'Slot';

	return {
		Fill: FillComponent,
		Slot: SlotComponent,
	};
}
