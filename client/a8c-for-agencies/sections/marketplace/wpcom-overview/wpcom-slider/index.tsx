import classNames from 'classnames';
import { useMemo, useState } from 'react';
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
};

export default function A4AWPCOMSlider( {
	className,
	options,
	onChange,
	value,
	label,
	sub,
}: Props ) {
	const total = 204;
	const mappedOptions = useMemo(
		() => mapOptionsToSliderOptions( options, total ),
		[ options, total ]
	);
	const [ currentValue, setCurrentValue ] = useState( value || 1 );
	const [ currentSliderPos, setCurrentSliderPos ] = useState(
		valueToSliderPos( value, mappedOptions )
	);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSliderChange = ( event: any ) => {
		const sliderPos = Number.parseInt( event.target.value );
		const selected = sliderPosToValue( sliderPos, mappedOptions );
		onChange?.( selected );
		setCurrentValue( selected );
		setCurrentSliderPos( sliderPos );
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onNumberInputChange = ( event: any ) => {
		const value = Number.parseInt( event.target.value ) || 1;
		onChange?.( value );
		setCurrentValue( value );
		setCurrentSliderPos( valueToSliderPos( value, mappedOptions ) );
	};

	return (
		<div className={ classNames( 'a4a-slider', className ) }>
			{ label && (
				<div className="a4a-slider__label-container">
					<div className="a4a-slider__label">{ label }</div>
					<div className="a4a-slider__sub">{ sub }</div>
				</div>
			) }

			<div className="a4a-slider__input">
				<input
					type="range"
					min="0"
					max={ total.toString() }
					onChange={ onSliderChange }
					value={ currentSliderPos }
					step="1"
				/>

				<div className="a4a-slider__marker-container">
					{ options.map( ( option, index ) => {
						return (
							<div
								className="a4a-slider__marker"
								key={ `slider-option-${ option.value }` }
								role="button"
								tabIndex={ -1 }
								onClick={ () => onChange?.( index ) }
								onKeyDown={ ( event ) => {
									if ( event.key === 'Enter' ) {
										onChange?.( index );
									}
								} }
							>
								<div className="a4a-slider__marker-line"></div>
								<div className="a4a-slider__marker-label">{ option.label }</div>
								{ option.sub && <div className="a4a-slider__marker-sub">{ option.sub }</div> }
							</div>
						);
					} ) }
				</div>
			</div>
			<input
				type="number"
				className="a4a-slider__number-input"
				value={ currentValue }
				onChange={ onNumberInputChange }
			></input>
		</div>
	);
}
