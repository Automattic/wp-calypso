import clsx from 'clsx';
import { useMemo, useRef, useState } from 'react';
import {
	mapOptionsToSliderOptions,
	sliderPosToValue,
	valueToSliderPos,
} from '../lib/wpcom-bulk-values-utils';
import './style.scss';

export type Option = {
	label: string;
	value: number | string | null;
	sub?: string;
};

type Props = {
	className?: string;
	options: Option[];
	onChange?: ( value: number ) => void;
	value: number;
	label?: string;
	sub?: string;
	minimum?: number;
	readOnly?: boolean;
};

export default function A4AWPCOMSlider( {
	className,
	options,
	onChange,
	value,
	label,
	sub,
	minimum = 0,
	readOnly,
}: Props ) {
	const total = ( options.length + 1 ) * 20;
	const mappedOptions = useMemo(
		() => mapOptionsToSliderOptions( options, total ),
		[ options, total ]
	);

	const rangeRef = useRef< HTMLInputElement >( null );

	const defaultValue = ( value || 1 ) < minimum ? minimum : value || 1;

	const [ currentValue, setCurrentValue ] = useState( defaultValue );
	const [ currentSliderPos, setCurrentSliderPos ] = useState(
		valueToSliderPos( defaultValue, mappedOptions )
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSliderChange = ( event: any ) => {
		const sliderPos = Number( event.target.value );
		const selected = sliderPosToValue( sliderPos, mappedOptions );

		const next = selected < minimum ? minimum : selected;

		if ( readOnly ) {
			return;
		}

		onChange?.( next );
		setCurrentValue( next );
		setCurrentSliderPos( selected < minimum ? valueToSliderPos( next, mappedOptions ) : sliderPos );
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onNumberInputChange = ( event: any ) => {
		const value = event.target.value;
		// Our next value will be determine based on the minimum input.
		const next = isNaN( value ) || value < minimum ? minimum : value;
		onChange?.( next );
		setCurrentValue( value ); // We do not want to override the value with next here to avoid disrupting user input.
		setCurrentSliderPos( valueToSliderPos( next, mappedOptions ) );
	};

	const onNumberInputBlur = () => {
		// When the mouse cursor goes out, we need to make sure the value is within the range.
		const next = isNaN( currentValue ) || currentValue < minimum ? minimum : currentValue;
		onChange?.( next );
		setCurrentValue( next );
		setCurrentSliderPos( valueToSliderPos( next, mappedOptions ) );
	};

	const onNumberSelect = ( value: number ) => {
		if ( value >= minimum && ! readOnly ) {
			onChange?.( value );
			setCurrentValue( value );
			setCurrentSliderPos( valueToSliderPos( value, mappedOptions ) );
		}
	};

	const ratio = valueToSliderPos( minimum, mappedOptions ) / total;

	const thumbSize = 14;
	const sliderWidth = rangeRef.current?.offsetWidth ?? 1;
	const disabledAreaWidth =
		minimum >= mappedOptions[ mappedOptions.length - 1 ].maxValue
			? `${ sliderWidth - thumbSize }px`
			: `${ ratio * sliderWidth - thumbSize * ratio }px`;

	return (
		<div className={ clsx( 'a4a-slider', className ) }>
			{ label && (
				<div className="a4a-slider__label-container">
					<div className="a4a-slider__label">{ label }</div>
					<div className="a4a-slider__sub">{ sub }</div>
				</div>
			) }

			<div className="a4a-slider__input">
				{ ! readOnly && (
					<div
						className="a4a-slider__input-disabled-area"
						style={ {
							width: disabledAreaWidth,
						} }
					></div>
				) }

				<input
					ref={ rangeRef }
					type="range"
					min="0"
					max={ total.toString() }
					onChange={ onSliderChange }
					value={ currentSliderPos }
					step="1"
					readOnly={ readOnly }
				/>

				<div className="a4a-slider__marker-container">
					{ options.map( ( option, index ) => {
						return (
							<div
								className="a4a-slider__marker"
								key={ `slider-option-${ option.value }` }
								role="button"
								tabIndex={ -1 }
								onClick={ () => {
									onNumberSelect( option.value as number );
								} }
								onKeyDown={ ( event ) => {
									if ( event.key === 'Enter' ) {
										onNumberSelect( option.value as number );
									}
								} }
							>
								<div className="a4a-slider__marker-line"></div>
								<div className="a4a-slider__marker-label">
									{ option.label }
									{ index === options.length - 1 && '+' }
								</div>
								{ option.sub && <div className="a4a-slider__marker-sub">{ option.sub }</div> }
							</div>
						);
					} ) }
				</div>
			</div>
			{ ! readOnly && (
				<input
					type="number"
					className="a4a-slider__number-input"
					value={ currentValue }
					onChange={ onNumberInputChange }
					onBlur={ onNumberInputBlur }
				></input>
			) }
		</div>
	);
}
