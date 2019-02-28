/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';

export const name = 'markdown';

// This is a Core translation available in Gutenberg.
const save = () => <div>{ __( 'Advanced' ) }</div>;

export const settings = {
	title: __( 'Markdown' ),
	description:
		'Demo breakage on translation change. Add this block and change site language. Reload to invalidate block.',
	category: 'jetpack',
	edit: save,
	save,
};
