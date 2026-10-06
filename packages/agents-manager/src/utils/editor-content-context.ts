import { getBlockType, getBlockTypes } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { getBlockNames } from './editor-blocks';
import { getSelectedTextContext } from './get-selected-text';
import { getCustomCss, getEditedGlobalStyles, waitForEditedGlobalStyles } from './global-styles';

// The agent knows the core and Jetpack blocks; any other block on the page
// needs its schema.
const needsSchema = ( name: string ): boolean =>
	! name.startsWith( 'core/' ) && ! name.startsWith( 'jetpack/' );

// What the agent needs of a block type, not its icon or editor functions.
const SCHEMA_FIELDS = [
	'name',
	'title',
	'description',
	'category',
	'keywords',
	'attributes',
	'supports',
	'providesContext',
] as const;

const getBlockSchemas = (): Record< string, unknown >[] =>
	[ ...getBlockNames() ]
		.filter( needsSchema )
		.flatMap( ( name ) => getBlockType( name ) ?? [] )
		.map( ( blockType ) =>
			Object.fromEntries( SCHEMA_FIELDS.map( ( field ) => [ field, blockType[ field ] ] ) )
		);

/**
 * The editor's block types, selected text and custom CSS for the client
 * context. Empty when the editor cannot be read: a context read must never
 * fail the turn.
 */
export function getEditorContentContext(): Record< string, unknown > {
	try {
		// The backend reads only the names.
		const availableBlocks = getBlockTypes().map( ( { name } ) => name );
		const blockSchema = getBlockSchemas();
		const selectedText = getSelectedTextContext( select );
		const globalStyles = getEditedGlobalStyles();
		const customCSS = globalStyles ? getCustomCss( globalStyles.record ) : '';

		return {
			...( availableBlocks.length && { availableBlocks } ),
			...( blockSchema.length && { blockSchema } ),
			...( selectedText && { selectedText } ),
			...( customCSS && { customCSS } ),
		};
	} catch {
		return {};
	}
}

/**
 * Starts loading what the context reads but an editor may not have yet: the
 * post editor fetches the global styles only once something asks for them.
 */
export function preloadEditorContentContext(): void {
	void waitForEditedGlobalStyles();
}
