import usePickerVariations from '../../hooks/use-picker-variations';
import VariationPicker from '../variation-picker';
import type { PickerSurfaceProps } from '../style-pickers/types';
import type { StyleVariation } from '../styles-preview';

interface Props extends PickerSurfaceProps {
	variations?: StyleVariation[];
}

export default function ColorPicker( { variations, surfaceId, disabled }: Props ) {
	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations,
		surfaceId,
		variationType: 'color',
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
			disabled={ disabled }
			onSelect={ handleSelect }
			activeVariationTitle={ activeTitle }
		/>
	);
}
