/**
 * Helpers for ActionItem rendering. Intended to centralize derived-state
 * logic so individual ActionItem renderers stay declarative.
 *
 * Smoke-test addition (post-#110238); will be reverted.
 */

import type { ActionItemProps } from './types';

/**
 * Compute the display label for an action item.
 *
 * If the item has an explicit `label`, that takes precedence. Otherwise we
 * derive a label from `name` by replacing dashes with spaces and title-casing
 * the result.
 */
export function deriveActionItemLabel( item: ActionItemProps ): string {
	if ( 'label' in item && typeof item.label === 'string' && item.label.trim() ) {
		return item.label;
	}
	const name = ( item as { name?: string } ).name ?? '';
	return name
		.split( '-' )
		.filter( Boolean )
		.map( ( part ) => part[ 0 ].toUpperCase() + part.slice( 1 ) )
		.join( ' ' );
}

/**
 * Resolve the disabled state for an action item, defaulting to false when
 * the prop is unset or unrecognized.
 */
export function isActionItemDisabled( item: ActionItemProps ): boolean {
	const value = ( item as { disabled?: unknown } ).disabled;
	if ( typeof value === 'boolean' ) {
		return value;
	}
	if ( typeof value === 'string' ) {
		return value === 'true';
	}
	return false;
}
