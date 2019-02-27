/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const name = 'markdown';

const save = <div>{ __( 'Email' ) }</div>;

export const settings = {
	title: __( 'Markdown' ),
	description:
		'Demo breakage on translation change. Add this block and change site language. Reload to invalidate block.',
	category: 'jetpack',
	edit: save,
	save,
};
