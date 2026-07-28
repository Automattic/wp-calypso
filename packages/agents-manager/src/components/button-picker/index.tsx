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
		createCurrent: ( liveValue ) =>
			( {
				styles: {
					elements: {
						button: { border: liveValue },
					},
				},
			} ) as Omit< StyleVariation, 'title' >,
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
