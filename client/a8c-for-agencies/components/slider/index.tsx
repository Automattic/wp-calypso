import classNames from 'classnames';

import './style.scss';

export type Option = {
	label: string;
	value: number;
};

type Props = {
	className?: string;
	options: Option[];
	key?: string;
	onChange?: ( value: Option ) => void;
	value: number;
};

export default function A4ASlider( {
	className,
	options,
	key = 'generic',
	onChange,
	value,
}: Props ) {
	const dataListKey = `a4a-slider-datalist-${ key }`;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSliderChange = ( event: any ) => {
		onChange?.( options[ event.target.value ] );
	};

	return (
		<div className={ classNames( 'a4a-slider', className ) }>
			<input
				type="range"
				min="0"
				max={ options.length - 1 }
				list={ dataListKey }
				onChange={ onSliderChange }
				value={ value }
			/>

			<datalist className="a4a-slider__marker-container" id={ dataListKey }>
				{ options.map( ( option, index ) => {
					return (
						<option
							className="a4a-slider__marker"
							key={ `slider-option-${ index }` }
							value={ option.value }
						>
							{ option.label }
						</option>
					);
				} ) }
			</datalist>
		</div>
	);
}
