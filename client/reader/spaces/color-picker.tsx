import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SPACE_COLORS, useSpaceColorLabels } from './colors';
import type { SpaceColor } from '@automattic/api-core';

import './color-picker.scss';

interface Props {
	value: SpaceColor;
	onChange: ( color: SpaceColor ) => void;
}

/**
 * A radiogroup of accent-color swatches. Each swatch is a visually-hidden native
 * radio wrapped in a label, so arrow keys move between options and there is a
 * single tab stop — matching the layout-preset cards. The selected swatch shows
 * a check; colors are read out via the translated labels in `useSpaceColorLabels`.
 */
export function SpaceColorPicker( { value, onChange }: Props ) {
	const translate = useTranslate();
	const labels = useSpaceColorLabels();

	return (
		<div
			className="space-color-picker"
			role="radiogroup"
			aria-label={ translate( 'Accent color' ) }
		>
			{ SPACE_COLORS.map( ( color ) => {
				const isSelected = color === value;
				return (
					<label
						key={ color }
						className={ `space-color-picker__swatch space-color-picker__swatch--${ color }` }
						data-selected={ isSelected }
					>
						<input
							type="radio"
							className="space-color-picker__radio"
							name="space-accent-color"
							value={ color }
							checked={ isSelected }
							aria-label={ labels[ color ] }
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
