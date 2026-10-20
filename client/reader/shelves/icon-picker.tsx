import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SHELF_ICONS } from './icons';
import type { ShelfIcon } from '@automattic/api-core';

import './icon-picker.scss';

interface Props {
	value: ShelfIcon;
	onChange: ( icon: ShelfIcon ) => void;
}

/**
 * A radiogroup of icon tiles, rendering every glyph in `SHELF_ICONS`. Uses the
 * same visually-hidden-radio-in-a-label pattern as the color picker and layout
 * cards so keyboard behaviour is consistent across the modal.
 */
export function ShelfIconPicker( { value, onChange }: Props ) {
	const translate = useTranslate();

	// Accessible names for the icon-only tiles. Keyed by `ShelfIcon` so adding a
	// glyph to `SHELF_ICONS` surfaces a type error here until it gets a label.
	const labels: Record< ShelfIcon, string > = {
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
		<div className="shelf-icon-picker" role="radiogroup" aria-label={ translate( 'Icon' ) }>
			{ ( Object.keys( SHELF_ICONS ) as ShelfIcon[] ).map( ( icon ) => {
				const isSelected = icon === value;
				return (
					<label key={ icon } className="shelf-icon-picker__tile" data-selected={ isSelected }>
						<input
							type="radio"
							className="shelf-icon-picker__radio"
							name="shelf-icon"
							value={ icon }
							checked={ isSelected }
							aria-label={ labels[ icon ] }
							onChange={ () => onChange( icon ) }
						/>
						<Icon icon={ SHELF_ICONS[ icon ] } size={ 24 } />
					</label>
				);
			} ) }
		</div>
	);
}
