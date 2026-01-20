import { useResizeObserver } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

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
};

export default function A4ASlider( {
	className,
	options,
	onChange,
	value,
	label,
	sub,
	minimum = 0,
}: Props ) {
	const rangeRef = useRef< HTMLInputElement >( null );
	const [ resizeListener, { width } ] = useResizeObserver();
	const sliderWidth = width ?? 0;

	// Safeguard incase we have minimum value that is out of bounds
	const normalizeMinimum = Math.min( minimum, options.length - 1 );

	// Ensure displayed value is never below minimum
	const displayValue = Math.max( value, normalizeMinimum );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSliderChange = ( event: any ) => {
		const next = event.target.value;
		onChange?.( options[ Math.max( next, normalizeMinimum ) ] );
	};

	const sliderSectionWidth = sliderWidth / ( options.length - 1 );

	// Disabled area covers owned sites (indices 0 through minimum-1).
	// With minimum=3, gray covers indices 0,1,2 (labels 1,2,3), extending to position 2.
	const valueOffset = Math.round( ( THUMB_SIZE * displayValue ) / ( options.length - 1 ) );
	const lastOwnedIndex = normalizeMinimum - 1;
	const lastOwnedOffset = Math.round( ( THUMB_SIZE * lastOwnedIndex ) / ( options.length - 1 ) );
	// Add half the thumb size to align with marker center
	const disabledEndPosition =
		normalizeMinimum > 0
			? sliderSectionWidth * lastOwnedIndex + THUMB_SIZE / 2 - lastOwnedOffset
			: 0;
	const disabledAreaWidth = `${ disabledEndPosition }px`;

	// Fill area shows progress from minimum to current value (the newly selected portion).
	// Starts where disabled area ends for visual continuity.
	const fillAreaLeft = `${ disabledEndPosition }px`;
	const fillEndPosition = sliderSectionWidth * displayValue - valueOffset;
	const fillAreaWidth = `${ Math.max( 0, fillEndPosition - disabledEndPosition + 1 ) }px`;

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
				{ resizeListener }
				<div
					className="a4a-slider__input-fill-area"
					style={ {
						left: fillAreaLeft,
						width: fillAreaWidth,
					} }
				></div>
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
					onChange={ onSliderChange }
					value={ displayValue }
				/>

				<div className="a4a-slider__marker-container">
					{ options.map( ( option, index ) => {
						return (
							<div
								className="a4a-slider__marker"
								key={ `slider-option-${ option.value }` }
								role="button"
								tabIndex={ -1 }
								onClick={ () => onChange?.( options[ Math.max( index, normalizeMinimum ) ] ) }
								onKeyDown={ ( event ) => {
									if ( event.key === 'Enter' ) {
										onChange?.( options[ Math.max( index, normalizeMinimum ) ] );
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
