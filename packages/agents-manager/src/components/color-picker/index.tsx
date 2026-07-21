import { __ } from '@wordpress/i18n';
import usePickerVariations from '../../hooks/use-picker-variations';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_COLORS_TO_SHOW = 4;

interface Props {
	variations: StyleVariation[];
	currentColor?: string | null;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function ColorPicker( { variations, currentColor = null, onSelect }: Props ) {
	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations,
		initialActiveTitle: currentColor,
		getLiveValue: ( globalStyles ) => globalStyles.settings?.color?.palette?.theme,
		getValue: ( variation ) => variation.settings?.color?.palette?.theme,
		createCurrent: ( liveValue, globalStyles ) =>
			( {
				title: __( 'Current', __i18n_text_domain__ ),
				settings: { color: { palette: { theme: liveValue } } },
				styles: globalStyles.styles ?? {},
			} ) as StyleVariation,
		onSelect,
	} );

	if ( ! sortedVariations.length ) {
		return null;
	}

	return (
		<VariationPicker
			variations={ sortedVariations }
			maxToShow={ MAX_COLORS_TO_SHOW }
			type="color"
			onSelect={ handleSelect }
			activeVariationTitle={ activeTitle }
		/>
	);
}
