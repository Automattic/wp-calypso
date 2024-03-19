import classNames from 'classnames';

import './style.scss';

export type Option = {
	label: string;
	value: number;
};

type Props = {
	className?: string;
	options: Option[];
	onChange?: ( value: Option ) => void;
	value: number;
	label?: string;
};

export default function A4ASlider( { className, options, onChange, value, label }: Props ) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSliderChange = ( event: any ) => {
		onChange?.( options[ event.target.value ] );
	};

	return (
		<div className={ classNames( 'a4a-slider', className ) }>
			{ label && <div className="a4a-slider__label">{ label }</div> }

			<div className="a4a-slider__input">
				<input
					type="range"
					min="0"
					max={ options.length - 1 }
					onChange={ onSliderChange }
					value={ value }
				/>

				<div className="a4a-slider__marker-container">
					{ options.map( ( option, index ) => {
						return (
							<div className="a4a-slider__marker" key={ `slider-option-${ index }` }>
								<div className="a4a-slider__marker-line"></div>
								<div className="a4a-slider__marker-label">{ option.label }</div>
							</div>
						);
					} ) }
				</div>
			</div>
		</div>
	);
}
