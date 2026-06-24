import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SPACE_ICONS } from './icons';
import type { SpaceIcon } from '@automattic/api-core';

import './icon-picker.scss';

interface Props {
	value: SpaceIcon;
	onChange: ( icon: SpaceIcon ) => void;
}

/**
 * A radiogroup of icon tiles, rendering every glyph in `SPACE_ICONS`. Uses the
 * same visually-hidden-radio-in-a-label pattern as the color picker and layout
 * cards so keyboard behaviour is consistent across the modal.
 */
export function SpaceIconPicker( { value, onChange }: Props ) {
	const translate = useTranslate();

	// Accessible names for the icon-only tiles. Keyed by `SpaceIcon` so adding a
	// glyph to `SPACE_ICONS` surfaces a type error here until it gets a label.
	const labels: Record< SpaceIcon, string > = {
		inbox: translate( 'Inbox' ),
		box: translate( 'Box' ),
		video: translate( 'Video' ),
		comment: translate( 'Comment' ),
		cart: translate( 'Cart' ),
		star: translate( 'Star' ),
		pages: translate( 'Pages' ),
		category: translate( 'Category' ),
		globe: translate( 'Globe' ),
		tag: translate( 'Tag' ),
		rss: translate( 'Feed' ),
		people: translate( 'People' ),
		home: translate( 'Home' ),
		gallery: translate( 'Gallery' ),
		chart: translate( 'Chart' ),
		palette: translate( 'Palette' ),
	};

	return (
		<div className="space-icon-picker" role="radiogroup" aria-label={ translate( 'Icon' ) }>
			{ ( Object.keys( SPACE_ICONS ) as SpaceIcon[] ).map( ( icon ) => {
				const isSelected = icon === value;
				return (
					<label key={ icon } className="space-icon-picker__tile" data-selected={ isSelected }>
						<input
							type="radio"
							className="space-icon-picker__radio"
							name="space-icon"
							value={ icon }
							checked={ isSelected }
							aria-label={ labels[ icon ] }
							onChange={ () => onChange( icon ) }
						/>
						<Icon icon={ SPACE_ICONS[ icon ] } size={ 24 } />
					</label>
				);
			} ) }
		</div>
	);
}
