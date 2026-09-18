import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRef, useState } from 'react';

import './temporary-design-switch.scss';

export type CardPalette = 'product-brand' | 'a4a-brand' | 'ink-paper';
export type CardColorBy = 'product' | 'type' | 'single';
export type CardLogoPlacement = 'none' | 'header' | 'signature' | 'strip';
export type CardIntensity = 'vibrant' | 'subdued';

function Choices< T extends string >( {
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: { label: string; value: T }[];
	onChange: ( value: T ) => void;
} ) {
	return (
		<fieldset className="temporary-resource-choice-group">
			<legend>{ label }</legend>
			<div className="temporary-resource-design-options">
				{ options.map( ( option ) => (
					<Button
						key={ option.value }
						size="compact"
						variant={ value === option.value ? 'primary' : 'secondary' }
						aria-pressed={ value === option.value }
						onClick={ () => onChange( option.value ) }
					>
						{ option.label }
					</Button>
				) ) }
			</div>
		</fieldset>
	);
}

export default function TemporaryDesignSwitch( {
	value,
	onChange,
	colorBy,
	onColorByChange,
	palette,
	onPaletteChange,
	singleColor,
	onSingleColorChange,
	intensity,
	onIntensityChange,
	logoPlacement,
	onLogoPlacementChange,
}: {
	value: 'original' | 'typographic';
	onChange: ( value: 'original' | 'typographic' ) => void;
	colorBy: CardColorBy;
	onColorByChange: ( value: CardColorBy ) => void;
	palette: CardPalette;
	onPaletteChange: ( value: CardPalette ) => void;
	singleColor: string;
	onSingleColorChange: ( value: string ) => void;
	logoPlacement: CardLogoPlacement;
	onLogoPlacementChange: ( value: CardLogoPlacement ) => void;
	intensity: CardIntensity;
	onIntensityChange: ( value: CardIntensity ) => void;
} ) {
	const [ position, setPosition ] = useState( { x: 16, y: 16 } );
	const drag = useRef( { x: 0, y: 0 } );
	return (
		<aside
			className="temporary-resource-design-switch"
			aria-label={ __( 'Temporary card design controls' ) }
			style={ { left: position.x, top: position.y } }
		>
			<div
				className="temporary-resource-design-handle"
				onPointerDown={ ( event ) => {
					drag.current = { x: event.clientX - position.x, y: event.clientY - position.y };
					event.currentTarget.setPointerCapture( event.pointerId );
				} }
				onPointerMove={ ( event ) => {
					if ( event.currentTarget.hasPointerCapture( event.pointerId ) ) {
						setPosition( {
							x: Math.max( 0, Math.min( window.innerWidth - 240, event.clientX - drag.current.x ) ),
							y: Math.max(
								0,
								Math.min(
									window.innerHeight - ( event.currentTarget.parentElement?.offsetHeight ?? 96 ),
									event.clientY - drag.current.y
								)
							),
						} );
					}
				} }
				onPointerUp={ ( event ) => event.currentTarget.releasePointerCapture( event.pointerId ) }
			>
				{ __( 'Card design' ) } <span>{ __( 'Preview' ) }</span>
			</div>
			<div className="temporary-resource-design-options">
				<Button
					size="compact"
					variant={ value === 'original' ? 'primary' : 'tertiary' }
					aria-pressed={ value === 'original' }
					onClick={ () => onChange( 'original' ) }
				>
					{ __( 'Featured image' ) }
				</Button>
				<Button
					size="compact"
					variant={ value === 'typographic' ? 'primary' : 'tertiary' }
					aria-pressed={ value === 'typographic' }
					onClick={ () => onChange( 'typographic' ) }
				>
					{ __( 'Stylized titles' ) }
				</Button>
			</div>
			<fieldset className="temporary-resource-color-options" disabled={ value === 'original' }>
				<Choices< CardColorBy >
					label={ __( 'Color treatment' ) }
					value={ colorBy }
					onChange={ onColorByChange }
					options={ [
						{ label: __( 'Product' ), value: 'product' },
						{ label: __( 'Resource type' ), value: 'type' },
						{ label: __( 'Single color' ), value: 'single' },
					] }
				/>
				{ colorBy === 'single' ? (
					<label className="temporary-resource-color-picker">
						<span>{ __( 'Card color' ) }</span>
						<input
							type="color"
							value={ singleColor }
							onChange={ ( event ) => onSingleColorChange( event.target.value ) }
						/>
						<code>{ singleColor }</code>
					</label>
				) : (
					<Choices< CardPalette >
						label={ __( 'Color palette' ) }
						value={ palette }
						onChange={ onPaletteChange }
						options={ [
							...( colorBy === 'product'
								? [
										{ label: __( 'Product brand' ), value: 'product-brand' as const },
										{ label: __( 'A4A brand' ), value: 'a4a-brand' as const },
								  ]
								: [] ),
							{ label: __( 'Ink & paper' ), value: 'ink-paper' },
						] }
					/>
				) }
				<Choices< CardIntensity >
					label={ __( 'Color intensity' ) }
					value={ intensity }
					onChange={ onIntensityChange }
					options={ [
						{ label: __( 'Vibrant' ), value: 'vibrant' },
						{ label: __( 'Subdued' ), value: 'subdued' },
					] }
				/>
				<Choices< CardLogoPlacement >
					label={ __( 'Product logo' ) }
					value={ logoPlacement }
					onChange={ onLogoPlacementChange }
					options={ [
						{ label: __( 'None' ), value: 'none' },
						{ label: __( 'Header' ), value: 'header' },
						{ label: __( 'Signature' ), value: 'signature' },
						{ label: __( 'Brand strip' ), value: 'strip' },
					] }
				/>
			</fieldset>
		</aside>
	);
}
