import clsx from 'clsx';
import { useCallback, useEffect, useRef } from 'react';

import './style.scss';

const THUMB_SIZE = 14;

export type Option = {
	label: string;
	value: number | string | null;
	sub?: string;
};

type Props = {
	className?: string;
	options: Option[];
	onChange?: ( value: Option ) => void;
	value: number;
	label?: string;
	sub?: string;
	minimum?: number;
	readOnly?: boolean;
};

export default function A4ASlider( {
	className,
	options,
	onChange,
	value,
	label,
	sub,
	minimum = 0,
	readOnly,
}: Props ) {
	const rangeRef = useRef< HTMLInputElement >( null );

	// Safeguard incase we have minimum value that is out of bounds
	const normalizeMinimum = Math.min( minimum, options.length - 1 );

	const setValue = useCallback(
		( next: number ) => {
			if ( readOnly ) {
				return;
			}

			onChange?.( options[ Math.max( next, normalizeMinimum ) ] );
		},
		[ normalizeMinimum, onChange, options, readOnly ]
	);

	const sliderWidth = rangeRef.current?.offsetWidth ?? 1;
	const sliderSectionWidth = sliderWidth / ( options.length - 1 );

	// It is important we have offset otherwise we will encounter some overlapping issues with the thumb and disabled area.
	// Offset is calculated based on the Thumb size and position of the minimum value.
	const offset = Math.round( ( THUMB_SIZE * normalizeMinimum ) / ( options.length - 1 ) );
	const disabledAreaWidth = `${ sliderSectionWidth * normalizeMinimum - offset + 1 }px`;

	useEffect( () => {
		onChange?.( options[ Math.max( value, normalizeMinimum ) ] );
	}, [ normalizeMinimum, onChange, options, value ] );

	return (
		<div className={ clsx( 'a4a-slider', className ) }>
			{ label && (
				<div className="a4a-slider__label-container">
					<div className="a4a-slider__label">{ label }</div>
					<div className="a4a-slider__sub">{ sub }</div>
				</div>
			) }

			<div className="a4a-slider__input">
				<div
					className="a4a-slider__input-disabled-area"
					style={ {
						width: disabledAreaWidth,
					} }
				></div>

				<input
					ref={ rangeRef }
					type="range"
					min="0"
					max={ options.length - 1 }
					onChange={ ( event ) => setValue( Number( event.target.value ) ) }
					value={ value }
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
								onClick={ () => setValue( index ) }
								onKeyDown={ ( event ) => {
									if ( event.key === 'Enter' ) {
										setValue( index );
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
		</div>
	);
}
