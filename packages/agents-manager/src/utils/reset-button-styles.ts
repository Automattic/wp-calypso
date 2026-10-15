import type { GlobalStyles, StyleVariation } from '../components/styles-preview';

interface ButtonColor {
	background?: string;
	text?: string;
}

interface ButtonElement {
	border?: Record< string, string > | string;
	spacing?: { padding?: Record< string, string > | string };
	color?: ButtonColor;
	buttonColor?: ButtonColor;
	[ key: string ]: unknown;
}

interface BlockStyles {
	variations?: Record< string, { elements?: { button?: ButtonElement } } >;
	[ key: string ]: unknown;
}

// Match the button height of the Jetpack input fields — vertical padding is
// not mirrored.
const MIRROR_SKIPPED_KEYS = new Set( [ 'top', 'bottom' ] );

const withImportant = ( value: unknown ): unknown => {
	if ( ! value || typeof value !== 'object' ) {
		return typeof value === 'string' && ! value.includes( '!important' )
			? `${ value } !important`
			: value;
	}
	return Object.fromEntries(
		Object.entries( value as Record< string, unknown > )
			.filter( ( [ key ] ) => ! MIRROR_SKIPPED_KEYS.has( key ) )
			.map( ( [ key, entry ] ) => [ key, withImportant( entry ) ] )
	);
};

/**
 * Mirrors a button variation's element styles onto the `jetpack/subscriptions`
 * block with `!important`, matching Big Sky — the block styles its own
 * buttons, which would otherwise ignore the new treatment.
 */
export function mirrorButtonStylesToSubscriptionsBlock(
	styles: NonNullable< GlobalStyles[ 'styles' ] >,
	variation: StyleVariation
): NonNullable< GlobalStyles[ 'styles' ] > {
	const elements = variation.styles?.elements;
	if ( ! elements ) {
		return styles;
	}
	return {
		...styles,
		blocks: {
			...( styles.blocks as Record< string, unknown > | undefined ),
			'jetpack/subscriptions': { elements: withImportant( elements ) },
		},
	};
}

// Outline variations force their colors with `!important` on both values.
const isImportantColor = ( color?: ButtonColor ): boolean =>
	typeof color?.background === 'string' &&
	color.background.includes( '!important' ) &&
	typeof color?.text === 'string' &&
	color.text.includes( '!important' );

const withoutButtonBorderAndSpacing = ( button: ButtonElement ): ButtonElement => {
	const { border: _border, spacing: _spacing, ...rest } = button;
	return rest;
};

/**
 * Resets the applied button styles before a button variation merges, matching
 * Big Sky's apply behavior: `border` and `spacing` reset to the theme defaults
 * so a variation defines them from scratch, and an outline variation's
 * `!important` colors are stashed in `buttonColor` so the next non-outline
 * pick restores the previous button color.
 */
export default function resetButtonStyles(
	styles: NonNullable< GlobalStyles[ 'styles' ] >,
	variation: StyleVariation
): NonNullable< GlobalStyles[ 'styles' ] > {
	const next = { ...styles };

	const button = ( next.elements as { button?: ButtonElement } | undefined )?.button;
	if ( button ) {
		const updated = withoutButtonBorderAndSpacing( button );
		const incomingColor = ( variation.styles?.elements?.button as ButtonElement | undefined )
			?.color;
		if ( isImportantColor( incomingColor ) && ! updated.buttonColor ) {
			updated.buttonColor = button.color;
		}
		if ( isImportantColor( updated.color ) && updated.buttonColor ) {
			updated.color = updated.buttonColor;
		}
		next.elements = { ...next.elements, button: updated };
	}

	const blocks = next.blocks as Record< string, BlockStyles > | undefined;
	if ( blocks ) {
		next.blocks = Object.fromEntries(
			Object.entries( blocks ).map( ( [ blockName, block ] ) => {
				if ( ! block?.variations ) {
					return [ blockName, block ];
				}
				const variations = Object.fromEntries(
					Object.entries( block.variations ).map( ( [ name, blockVariation ] ) => {
						const blockButton = blockVariation?.elements?.button;
						if ( ! blockButton ) {
							return [ name, blockVariation ];
						}
						return [
							name,
							{
								...blockVariation,
								elements: {
									...blockVariation.elements,
									button: withoutButtonBorderAndSpacing( blockButton ),
								},
							},
						];
					} )
				);
				return [ blockName, { ...block, variations } ];
			} )
		);
	}

	return next;
}
