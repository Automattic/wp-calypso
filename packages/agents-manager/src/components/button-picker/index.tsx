import usePickerVariations from '../../hooks/use-picker-variations';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_BUTTONS_TO_SHOW = 12;

const getButtonBorder = ( variation: StyleVariation ): unknown =>
	( variation.styles?.elements?.button as Record< string, unknown > | undefined )?.border;

interface Props {
	buttonVariations?: StyleVariation[];
	maxButtonsToShow?: number;
}

export default function ButtonPicker( {
	buttonVariations,
	maxButtonsToShow = MAX_BUTTONS_TO_SHOW,
}: Props ) {
	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations: buttonVariations,
		pickActionName: 'buttonPickerItemSelected',
		variationType: 'button',
		getLiveValue: ( globalStyles ) => globalStyles.styles?.elements?.button?.border,
		getValue: getButtonBorder,
		// Snapshot the applied button element so picking "Current" restores the
		// full previous button treatment (border, spacing, colors) — the button
		// reset clears what the snapshot doesn't carry, and anything beyond the
		// button would leak into the subscriptions mirror.
		createCurrent: ( _liveValue, globalStyles ) => {
			const { buttonColor: _stash, ...button } = ( globalStyles.styles?.elements?.button ??
				{} ) as Record< string, unknown >;
			return { styles: { elements: { button } } } as Omit< StyleVariation, 'title' >;
		},
	} );

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			maxToShow={ maxButtonsToShow }
			type="button"
			onSelect={ handleSelect }
			activeVariationTitle={ activeTitle }
		/>
	);
}
