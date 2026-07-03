import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SPACE_COLORS, useSpaceColorLabels } from './colors';
import type { SpaceColor, SpaceTextColor } from '@automattic/api-core';

import './color-picker.scss';

interface Props {
	value: SpaceTextColor;
	onChange: ( color: SpaceTextColor ) => void;
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
 * a check; colors are read out via the translated labels in `useSpaceColorLabels`.
 */
export function SpaceColorPicker( {
	value,
	onChange,
	allowNone = false,
	name = 'space-accent-color',
	label,
}: Props ) {
	const translate = useTranslate();
	const labels = useSpaceColorLabels();

	const options: SpaceTextColor[] = allowNone ? [ 'none', ...SPACE_COLORS ] : SPACE_COLORS;

	return (
		<div
			className="space-color-picker"
			role="radiogroup"
			aria-label={ label ?? translate( 'Accent color' ) }
		>
			{ options.map( ( color ) => {
				const isSelected = color === value;
				const isNone = color === 'none';
				return (
					<label
						key={ color }
						className={ `space-color-picker__swatch space-color-picker__swatch--${ color }` }
						data-selected={ isSelected }
					>
						<input
							type="radio"
							className="space-color-picker__radio"
							name={ name }
							value={ color }
							checked={ isSelected }
							aria-label={ isNone ? translate( 'None' ) : labels[ color as SpaceColor ] }
							onChange={ () => onChange( color ) }
						/>
						{ isSelected ? (
							<Icon className="space-color-picker__check" icon={ check } size={ 20 } />
						) : null }
					</label>
				);
			} ) }
		</div>
	);
}
