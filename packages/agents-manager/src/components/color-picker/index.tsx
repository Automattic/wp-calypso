import usePickerVariations from '../../hooks/use-picker-variations';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

interface Props {
	variations: StyleVariation[];
	currentColor?: string | null;
}

export default function ColorPicker( { variations, currentColor = null }: Props ) {
	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations,
		initialActiveTitle: currentColor,
		getLiveValue: ( globalStyles ) => globalStyles.settings?.color?.palette?.theme,
		getValue: ( variation ) => variation.settings?.color?.palette?.theme,
		createCurrent: ( liveValue, globalStyles ) =>
			( {
				settings: { color: { palette: { theme: liveValue } } },
				styles: globalStyles.styles ?? {},
			} ) as Omit< StyleVariation, 'title' >,
	} );

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			type="color"
			onSelect={ handleSelect }
			activeVariationTitle={ activeTitle }
		/>
	);
}
