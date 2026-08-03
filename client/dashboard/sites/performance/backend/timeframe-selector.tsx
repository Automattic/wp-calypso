import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DEFAULT_TIMEFRAME, TIMEFRAME_OPTIONS, type Timeframe } from './timeframe';

export default function TimeframeSelector( {
	value,
	onChange,
}: {
	value: Timeframe;
	onChange: ( value: Timeframe ) => void;
} ) {
	return (
		<SelectControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ __( 'Timeframe' ) }
			hideLabelFromVision
			value={ value }
			options={ TIMEFRAME_OPTIONS }
			onChange={ ( next ) => onChange( ( next as Timeframe ) || DEFAULT_TIMEFRAME ) }
		/>
	);
}
