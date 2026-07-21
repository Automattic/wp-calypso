import { __ } from '@wordpress/i18n';
import usePickerVariations from '../../hooks/use-picker-variations';
import VariationPicker from '../variation-picker';
import type { StyleVariation } from '../styles-preview';

const MAX_BUTTONS_TO_SHOW = 12;

const getButtonBorder = ( variation: StyleVariation ): unknown =>
	( variation.styles?.elements?.button as Record< string, unknown > | undefined )?.border;

interface Props {
	buttonVariations?: StyleVariation[];
	maxButtonsToShow?: number;
	currentButtonStyle?: string | null;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function ButtonPicker( {
	buttonVariations,
	maxButtonsToShow = MAX_BUTTONS_TO_SHOW,
	currentButtonStyle = null,
	onSelect,
}: Props ) {
	const { sortedVariations, activeTitle, handleSelect } = usePickerVariations( {
		variations: buttonVariations,
		initialActiveTitle: currentButtonStyle,
		getLiveValue: ( globalStyles ) => globalStyles.styles?.elements?.button?.border,
		getValue: getButtonBorder,
		createCurrent: ( liveValue ) =>
			( {
				title: __( 'Current', __i18n_text_domain__ ),
				styles: {
					elements: {
						button: { border: liveValue },
					},
				},
			} ) as StyleVariation,
		onSelect,
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
