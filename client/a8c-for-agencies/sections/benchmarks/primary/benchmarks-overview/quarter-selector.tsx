import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { formatQuarterLong } from '../../lib/format-quarter';
import type { Quarter } from '../../constants';

type Props = {
	quarters: Quarter[];
	value: Quarter;
	onChange: ( quarter: Quarter ) => void;
};

const toValue = ( { quarter, year }: Quarter ): string => `${ year }-${ quarter }`;

export default function QuarterSelector( { quarters, value, onChange }: Props ) {
	const handleChange = ( nextValue: string ) => {
		const next = quarters.find( ( q ) => toValue( q ) === nextValue );
		if ( next ) {
			onChange( next );
		}
	};

	return (
		<SelectControl
			className="benchmarks-quarter-selector"
			label={ __( 'Quarter' ) }
			hideLabelFromVision
			value={ toValue( value ) }
			options={ quarters.map( ( q ) => ( {
				label: formatQuarterLong( q ),
				value: toValue( q ),
			} ) ) }
			onChange={ handleChange }
			__nextHasNoMarginBottom
		/>
	);
}
