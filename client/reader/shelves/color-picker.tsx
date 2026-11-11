import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SHELF_COLORS, useShelfColorLabels } from './colors';
import type { ShelfColor, ShelfTextColor } from '@automattic/api-core';

import './color-picker.scss';

interface Props {
	value: ShelfTextColor;
	onChange: ( color: ShelfTextColor ) => void;
	/**
	 * Prepend a "None" swatch that clears the color (neutral). Used by the text
	 * accent picker; the icon picker omits it since an icon always has a color.
	 */
	allowNone?: boolean;
	/** Unique radio group name, so multiple pickers on one screen don't collide. */
	name?: string;
	/** Accessible label for the group. */
	label?: string;
}

/**
 * A radiogroup of accent-color swatches. Each swatch is a visually-hidden native
 * radio wrapped in a label, so arrow keys move between options and there is a
 * single tab stop — matching the layout-preset cards. The selected swatch shows
 * a check; colors are read out via the translated labels in `useShelfColorLabels`.
 */
export function ShelfColorPicker( {
	value,
	onChange,
	allowNone = false,
	name = 'shelf-accent-color',
	label,
}: Props ) {
	const translate = useTranslate();
	const labels = useShelfColorLabels();

	const options: ShelfTextColor[] = allowNone ? [ 'none', ...SHELF_COLORS ] : SHELF_COLORS;

	return (
		<div
			className="shelf-color-picker"
			role="radiogroup"
			aria-label={ label ?? translate( 'Accent color' ) }
		>
			{ options.map( ( color ) => {
				const isSelected = color === value;
				const isNone = color === 'none';
				return (
					<label
						key={ color }
						className={ `shelf-color-picker__swatch shelf-color-picker__swatch--${ color }` }
						data-selected={ isSelected }
					>
						<input
							type="radio"
							className="shelf-color-picker__radio"
							name={ name }
							value={ color }
							checked={ isSelected }
							aria-label={ isNone ? translate( 'None' ) : labels[ color as ShelfColor ] }
							onChange={ () => onChange( color ) }
						/>
						{ isSelected ? (
							<Icon className="shelf-color-picker__check" icon={ check } size={ 20 } />
						) : null }
					</label>
				);
			} ) }
		</div>
	);
}
