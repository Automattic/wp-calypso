type Option = {
	label: string;
	value: number | string | null;
	sub?: string;
};

type SliderOption = {
	minAbsolute: number;
	maxAbsolute: number;
	minValue: number;
	maxValue: number;
};

export const mapOptionsToSliderOptions = ( options: Option[], total: number ) => {
	return options.map( ( _, index ) => {
		const minAbsolute = ( total * index ) / ( options.length - 1 );
		const maxAbsolute = ( total * ( index + 1 ) ) / ( options.length - 1 );
		const minValue = options[ index ].value as number;
		const maxValue = (
			options[ index + 1 ] ? options[ index + 1 ].value : options[ index ].value
		) as number;

		return { minAbsolute, maxAbsolute, minValue, maxValue };
	} );
};

export const sliderPosToValue = ( sliderPos: number, options: SliderOption[] ) => {
	const foundOption = options.find(
		( option ) => sliderPos >= option.minAbsolute && sliderPos <= option.maxAbsolute
	);
	if ( ! foundOption ) {
		return 1;
	}
	const { minAbsolute, maxAbsolute, minValue, maxValue } = foundOption;
	const normalizedOption = ( sliderPos - minAbsolute ) / ( maxAbsolute - minAbsolute );
	return Math.floor( minValue + normalizedOption * ( maxValue - minValue ) );
};

export const valueToSliderPos = ( value: number, options: SliderOption[] ) => {
	const foundOption = options.find(
		( option ) => value >= option.minValue && value <= option.maxValue
	);
	if ( ! foundOption ) {
		return value === 0 ? 1 : options[ options.length - 1 ].maxAbsolute;
	}

	const { minAbsolute, maxAbsolute, minValue, maxValue } = foundOption;
	const normalizedValue = ( value - minValue ) / ( maxValue - minValue );
	return Math.floor( minAbsolute + normalizedValue * ( maxAbsolute - minAbsolute ) );
};

export type DiscountTier = Option & {
	discount: number;
};

export const calculateTier = ( options: DiscountTier[], value: number ) => {
	let tier = options[ 0 ];

	for ( const option of options ) {
		if ( Number( option.value ) > value ) {
			break;
		}

		tier = option;
	}

	return {
		...tier,
		value,
	};
};
